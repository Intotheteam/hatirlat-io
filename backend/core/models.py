from django.db import models

class Customer(models.Model):
    name = models.CharField(max_length=100)
    surname = models.CharField(max_length=100, blank=True, default="")
    phone_number = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)

    def __str__(self):
        return f"{self.name} {self.surname} - {self.phone_number}"


class ReminderGroup(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    join_code = models.CharField(max_length=20, unique=True)  
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class GroupMembership(models.Model):
    ROLE_CHOICES = (
        ('Admin', 'Admin'),
        ('Member', 'Member'),
    )
    STATUS_CHOICES = (
        ('Active', 'Active'),
        ('Pending', 'Pending'),
    )

    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="memberships")
    group = models.ForeignKey(ReminderGroup, on_delete=models.CASCADE, related_name="members")
    is_active = models.BooleanField(default=True)
    joined_at = models.DateTimeField(auto_now_add=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='Member')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Pending')

    def __str__(self):
        return f"{self.customer} in {self.group} ({self.role})"



class Reminder(models.Model):
    REMINDER_TYPE_CHOICES = [
        ('Personal', 'Personal'),
        ('Group', 'Group'),
    ]
    REPEAT_CHOICES = [
        ('None', 'None'),
        ('Daily', 'Daily'),
        ('Weekly', 'Weekly'),
        ('Monthly', 'Monthly'),
    ]

    title = models.CharField(max_length=255)
    reminder_type = models.CharField(max_length=20, choices=REMINDER_TYPE_CHOICES)
    message = models.TextField()
    datetime = models.DateTimeField()
    repeat = models.CharField(max_length=20, choices=REPEAT_CHOICES, default='None')
    channels = models.JSONField()
    is_active = models.BooleanField(default=True)

    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True)
    group = models.ForeignKey(ReminderGroup, on_delete=models.SET_NULL, null=True, blank=True)

    contact_name = models.CharField(max_length=100, blank=True, null=True)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.reminder_type})"



