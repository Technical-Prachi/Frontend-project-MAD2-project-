import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

SMTP_SERVER = "localhost"  
SMTP_PORT = 1025  
SENDER_EMAIL = "Quiz_master@gmail.com"
SENDER_PASSWORD = ""

def send_email(to, subject, content): 
    try:
        print(f" Sending email to: {to}")
        print(f" Subject: {subject}")
        msg = MIMEMultipart()
        msg['To'] = to
        msg['Subject'] = subject
        msg['From'] = SENDER_EMAIL

        msg.attach(MIMEText(content, 'html'))

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as client:
            #client.starttl
            #client.login(SENDER_EMAIL, SENDER_PASSWORD)
            client.send_message(msg)
        print("Email sent successfully!")    

    except Exception as e:
        print(f"Email failed: {str(e)}")
