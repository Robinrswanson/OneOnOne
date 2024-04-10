from django.contrib import admin
from .models import Calendar, TimeSlot, CalendarContact, TimeSlotVote

admin.site.register(Calendar)
admin.site.register(TimeSlot)
admin.site.register(CalendarContact)
admin.site.register(TimeSlotVote)