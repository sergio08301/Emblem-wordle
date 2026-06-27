from apscheduler.schedulers.background import BackgroundScheduler

scheduler = BackgroundScheduler()


def start_scheduler():
    from app.services.email_service import check_and_send_digest
    scheduler.add_job(check_and_send_digest, "interval", hours=6, id="digest")
    scheduler.start()
    # Run once immediately on startup in case 10 days have already passed
    check_and_send_digest()


def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()
