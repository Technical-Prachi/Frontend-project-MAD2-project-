from celery.schedules import crontab
from backend.celery.tasks import email_reminder , generate_monthly_report , send_daily_quiz_reminders
from app import celery_app
from backend.models import User

@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    users = User.query.all() 
    #  Daily Reminder at 7:00 PM 
    for user in users:
        sender.add_periodic_task(
        crontab(hour=19, minute=00),  
        #crontab( minute="*/1"), 
        send_daily_quiz_reminders.s(),
        name='daily_remainder' 
            
        )
        sender.add_periodic_task(
        crontab(hour=8, minute=00, day_of_month='1'),
        #crontab( minute="*/1"),  
        generate_monthly_report.s(),
        name='monthly_report'
        )



    