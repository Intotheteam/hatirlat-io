from rest_framework import serializers
from .models import Customer, ReminderGroup, GroupMembership, Reminder

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'

class ReminderGroupSerializer(serializers.ModelSerializer):
    members = serializers.SerializerMethodField()

    class Meta:
        model = ReminderGroup
        fields = ['id', 'name', 'description', 'created_at', 'join_code', 'members']
        read_only_fields = ['join_code', 'created_at']

    def get_members(self, obj):
        return obj.members.count()  


class GroupMembershipSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='customer.name')
    email = serializers.EmailField(source='customer.email')
    phone_number = serializers.CharField(source='customer.phone_number')

    class Meta:
        model = GroupMembership
        fields = ['id', 'name', 'email', 'phone_number', 'role', 'status']



class ReminderSerializer(serializers.ModelSerializer):
    group = ReminderGroupSerializer(read_only=True)
    group_id = serializers.PrimaryKeyRelatedField(
        queryset=ReminderGroup.objects.all(),
        source='group',
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = Reminder
        fields = [
            "id", "title", "reminder_type", "channels", "contact_name",
            "contact_phone", "contact_email", "message", "datetime", "repeat",
            "is_active", "group", "group_id" 
        ]






