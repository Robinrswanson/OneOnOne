from rest_framework import serializers
from .models import Calendar, TimeSlot, CalendarContact, TimeSlotVote, Notification
from django.contrib.auth import get_user_model

class CalendarSerializer(serializers.ModelSerializer):
    
    owner_id = serializers.IntegerField(read_only=True, source='owner.id')
    owner_username = serializers.CharField(read_only=True, source='owner.username')
    
    class Meta:
        model = Calendar
        fields = ['id', 'name', 'comment', 'date_time_created', 'date_time_modified', 'finalized_timeslot', 'owner_id', 'owner_username', 'status']
        read_only_fields = ['date_time_created', 'date_time_modified', 'owner_id', 'owner_username', 'status', 'finalized_timeslot']


class TimeSlotSerializer(serializers.ModelSerializer):

    calendar_id = serializers.IntegerField(read_only=True, source='calendar.id')

    class Meta:
        model = TimeSlot
        
        fields = ['id', 'preference', 'start_date_time', 'duration', 'comment', 'last_modified', 'calendar_id']
        read_only_fields = ['last_modified']


class CalendarContactSerializer(serializers.ModelSerializer):

    contact_username = serializers.CharField(write_only=True)

    class Meta:
        model = CalendarContact
        fields = ['id', 'calendar', 'contact', 'contact_username', 'has_submitted']
        read_only_fields = ['calendar', 'has_submitted', 'contact']
    
    def create(self, validated_data):
        # Remove the field you do not want to include in object creation
        contact_username = validated_data.pop('contact_username', None)

        return super().create(validated_data)


class TimeSlotVoteSerializer(serializers.ModelSerializer):
   class Meta:
       model = TimeSlotVote
       fields = ['id', 'timeslot', 'preference']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'calendar', 'txt']
        