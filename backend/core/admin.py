from django.contrib import admin
from .models import Customer, ReminderGroup, GroupMembership  # örnek modeller

admin.site.register(Customer)
admin.site.register(ReminderGroup)
admin.site.register(GroupMembership)
