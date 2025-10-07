from django.core.management.base import BaseCommand
from django.utils import timezone
from django.core.mail import send_mail
from core.models import Reminder
from datetime import datetime, timedelta


# burayı kendi push servisimize göre değiştiricez
def send_push_notification(reminder, user_email):
    print(f"[PUSH] Bildirim gönderildi → '{reminder.title}' kullanıcısına: {user_email}")

def should_send_reminder(reminder):
    now = timezone.now()
    event_time = reminder.datetime
    repeat = reminder.repeat

    if repeat == "Daily":
        return (event_time.date() - now.date()).days >= 0

    elif repeat == "Weekly":
        return event_time.weekday() == now.weekday() and event_time.date() >= now.date()

    elif repeat == "Monthly":
        return event_time.day == now.day and event_time.date() >= now.date()

    elif repeat in (None, "", "Once"):
        return event_time.date() == now.date()

    return False

class Command(BaseCommand):
    help = "Send scheduled reminders"

    def handle(self, *args, **kwargs):
        now = timezone.now()
        reminders = Reminder.objects.filter(is_active=True, datetime__gte=now)

        if not reminders.exists():
            self.stdout.write(self.style.WARNING("Gönderilecek reminder yok."))
            return

        for reminder in reminders:
            event_time = reminder.datetime
            repeat = reminder.repeat
            channels = reminder.channels or []

            recipients = []

            if reminder.reminder_type == "Personal":
                if reminder.contact_email:
                    recipients.append(reminder.contact_email)
                elif reminder.customer and reminder.customer.email:
                     recipients.append(reminder.customer.email)


            elif reminder.reminder_type == "Group":
                group_members = reminder.group.members.filter(status='Active').select_related('customer')
                for membership in group_members:
                    if membership.customer and membership.customer.email:
                        recipients.append(membership.customer.email)

            self.stdout.write(f"Reminder: '{reminder.title}' - Date: {event_time} - Repeat: {repeat}")
            self.stdout.write(f"Alıcılar: {recipients}")

            send_message = should_send_reminder(reminder)
            self.stdout.write(f"Şart kontrolü (send_message): {send_message}")

            if send_message and recipients:
                subject = f"Reminder: {reminder.title}"
                message = reminder.message

                if 'email' in channels:
                    try:
                        send_mail(
                            subject,
                            message,
                            'noreply@example.com',
                            recipients,
                            fail_silently=False,
                        )
                        self.stdout.write(self.style.SUCCESS(
                            f"[EMAIL] Gönderildi → '{reminder.title}' → {recipients}"
                        ))
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f"[EMAIL] Gönderilemedi: {e}"))

                if 'push' in channels:
                    for recipient_email in recipients:
                        try:
                            send_push_notification(reminder, recipient_email)
                            self.stdout.write(self.style.SUCCESS(
                                f"[PUSH] Gönderildi → '{reminder.title}' → {recipient_email}"
                            ))
                        except Exception as e:
                            self.stdout.write(self.style.ERROR(f"[PUSH] Gönderilemedi: {e}"))

            else:
                self.stdout.write(self.style.NOTICE(
                    f"Gönderilmedi → '{reminder.title}' için uygun şartlar sağlanmadı veya alıcı yok."
                ))

        self.stdout.write(self.style.SUCCESS("Reminder gönderim işlemi tamamlandı."))
