from django.urls import path
from .views import CalendarListPrimary, CalendarListSecondary, CalendarDetail, TimeSlotList, TimeSlotDetail, CalendarContactList, CalendarContactDetail, CalendarContactDelete, TimeSlotVoteView


app_name = 'calendars'
urlpatterns = [
    path('primary/', CalendarListPrimary.as_view(), name='calendar_list_primary'),
    path('secondary/', CalendarListSecondary.as_view(), name='calendar_list_secondary'),
    path('<int:calendar_id>/', CalendarDetail.as_view(), name='calendar_detail'),
    path('<int:calendar_id>/timeslots/', TimeSlotList.as_view(), name="timeslot_list"),
    path('timeslots/<int:timeslot_id>/', TimeSlotDetail.as_view(), name="timeslot_detail"),
    path('<int:calendar_id>/contacts/', CalendarContactList.as_view(), name="contact_list"),
    path('<int:calendar_id>/contacts/detail/', CalendarContactDetail.as_view(), name="contact_detail"),
    path('<int:calendar_id>/contacts/<int:contact_id>/', CalendarContactDelete.as_view(), name="contact_delete"),
    path('<int:calendar_id>/vote/', TimeSlotVoteView.as_view(), name='timeslot_vote'),
]