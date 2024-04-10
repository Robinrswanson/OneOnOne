from django.urls import path
from .views import CalendarListPrimary, CalendarListSecondary, CalendarDetail, TimeSlotList, TimeSlotDetail, CalendarContactList, CalendarContactDetail, CalendarContactDelete, TimeSlotVoteView, CalendarTimeSlotVotesView, CalendarFinalize, CalendarSuggest, TimeslotsRemaining, NotificationList, NotificationDelete


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
    path('<int:calendar_id>/timeslot-votes/', CalendarTimeSlotVotesView.as_view(), name='calendar_timeslot_votes'),
    path('<int:calendar_id>/finalization/', CalendarFinalize.as_view(), name="calendar_finalization"),
    path('<int:calendar_id>/suggestions/', CalendarSuggest.as_view(), name='calendar_suggestions'),
    # path('<int:calendar_id>/submissions/<int:contact_id>', CalendarSubmission.as_view(), name='calendar_submissions'),
    path('<int:calendar_id>/remaining-timeslots/', TimeslotsRemaining.as_view(), name='remaining_timeslots'),
    path('notifications/', NotificationList.as_view(), name='notifications'),
    path('notifications/<int:notification_id>/', NotificationDelete.as_view(), name="notifications_delete"),
]