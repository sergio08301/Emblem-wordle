import smtplib
from datetime import datetime, timedelta, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.digest_log import DigestLog
from app.models.feedback import Feedback
from app.models.game_session import GameSession
from app.models.user import User

DIGEST_DAYS = 10


def _should_send_digest(db: Session) -> bool:
    last = db.query(DigestLog).order_by(DigestLog.sent_at.desc()).first()
    if last is None:
        return True
    cutoff = datetime.now(timezone.utc) - timedelta(days=DIGEST_DAYS)
    sent_at = last.sent_at
    if sent_at.tzinfo is None:
        sent_at = sent_at.replace(tzinfo=timezone.utc)
    return sent_at < cutoff


def _collect_stats(db: Session, since: datetime) -> dict:
    new_users = db.query(User).filter(User.created_at >= since).count()
    sessions = db.query(GameSession).filter(GameSession.started_at >= since).all()
    games_played = len(sessions)
    games_won = sum(1 for s in sessions if s.won)
    unique_users = len({s.user_id for s in sessions if s.user_id})
    win_rate = round(games_won / games_played * 100, 1) if games_played else 0
    return {
        "new_users": new_users,
        "games_played": games_played,
        "games_won": games_won,
        "win_rate": win_rate,
        "active_logged_in_players": unique_users,
    }


def _build_html(feedback_rows, stats: dict, since: datetime) -> str:
    since_str = since.strftime("%d %b %Y")
    today_str = datetime.now(timezone.utc).strftime("%d %b %Y")

    fb_html = ""
    if feedback_rows:
        for f in feedback_rows:
            date_str = f.created_at.strftime("%d %b %Y %H:%M") if f.created_at else "—"
            fb_html += f"""
            <div style="border-left:3px solid #4f46e5;padding:8px 12px;margin-bottom:12px;background:#f5f5f5">
              <p style="margin:0 0 4px"><strong>{f.subject}</strong></p>
              <p style="margin:0 0 4px;color:#555">{f.message}</p>
              <p style="margin:0;font-size:12px;color:#888">From: {f.username or "anonymous"} · {date_str}</p>
            </div>"""
    else:
        fb_html = "<p style='color:#888'>No feedback received in this period.</p>"

    return f"""
    <html><body style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
      <h2 style="color:#4f46e5">FE Guess — {DIGEST_DAYS}-Day Digest</h2>
      <p style="color:#888;font-size:13px">{since_str} → {today_str}</p>

      <h3>📊 Activity</h3>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:6px 0;color:#555">New registered users</td><td><strong>{stats["new_users"]}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#555">Games played</td><td><strong>{stats["games_played"]}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#555">Games won</td><td><strong>{stats["games_won"]} ({stats["win_rate"]}%)</strong></td></tr>
        <tr><td style="padding:6px 0;color:#555">Unique logged-in players</td><td><strong>{stats["active_logged_in_players"]}</strong></td></tr>
      </table>

      <h3>💬 Feedback ({len(feedback_rows)})</h3>
      {fb_html}

      <hr style="margin-top:32px;border:none;border-top:1px solid #eee">
      <p style="font-size:12px;color:#aaa;text-align:center">FE Guess automated digest</p>
    </body></html>
    """


def send_digest(db: Session) -> None:
    if not settings.smtp_user or not settings.smtp_password or not settings.digest_email:
        return

    since = datetime.now(timezone.utc) - timedelta(days=DIGEST_DAYS)
    feedback_rows = db.query(Feedback).filter(Feedback.created_at >= since).order_by(Feedback.created_at.desc()).all()
    stats = _collect_stats(db, since)
    html = _build_html(feedback_rows, stats, since)

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"FE Guess — {DIGEST_DAYS}-Day Digest"
    msg["From"] = settings.smtp_user
    msg["To"] = settings.digest_email
    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
        server.starttls()
        server.login(settings.smtp_user, settings.smtp_password)
        server.sendmail(settings.smtp_user, settings.digest_email, msg.as_string())

    db.add(DigestLog())
    db.commit()


def check_and_send_digest() -> None:
    from app.core.database import SessionLocal
    db = SessionLocal()
    try:
        if _should_send_digest(db):
            send_digest(db)
    except Exception as e:
        print(f"[digest] error: {e}")
    finally:
        db.close()
