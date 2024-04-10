from django.db import models
from django.conf import settings

# Create your models here.
class Calendar(models.Model):
    name = models.CharField(max_length=120)
    comment = models.TextField(max_length=200, blank=True)
    date_time_created = models.DateTimeField(auto_now_add=True)
    date_time_modified = models.DateTimeField(auto_now=True)
    # date_time_finalization = models.DateTimeField(null=True, blank=True)
    finalized_timeslot = models.ForeignKey('TimeSlot', on_delete=models.CASCADE, null=True, related_name='finalizing_calendars')
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    status = models.TextField(choices=(
        ('created', 'In Progress'),
        ('submitted', 'Submitted'),
        ('finalized', 'Finalized'),
    ), default='submitted')

    def __str__(self):
        return f"{self.id} {self.name}"
    
    def update_submission_status(self):
        """Update the calendar's status based on whether all contacts have submitted."""
        if not self.calendarcontact_set.filter(has_submitted=False).exists():
            # All contacts have submitted
            if self.status != 'submitted':  # Check to prevent unnecessary updates
                self.status = 'submitted'
                self.save()
        else:
            # Not all contacts have submitted
            if self.status != 'created':  # Check to prevent unnecessary updates
                self.status = 'created'
                self.save()


class TimeSlot(models.Model):
    
    preference = models.IntegerField(choices=(
        (1, 'Low Preference'),
        (2, 'Medium Preference'),
        (3, 'High Preference'),
    ))

    start_date_time = models.DateTimeField()
    duration = models.IntegerField(default=30)
    comment = models.TextField(max_length=200, blank=True)
    last_modified = models.DateTimeField(auto_now=True)
    calendar = models.ForeignKey(Calendar, on_delete=models.CASCADE, related_name="timeslots")

    def __str__(self):
        return f"{self.calendar.name} {self.start_date_time}"
    

class CalendarContact(models.Model):
    calendar = models.ForeignKey(Calendar, on_delete=models.CASCADE)
    contact = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    has_submitted = models.BooleanField(default=False)
    
    class Meta:
        unique_together = [['calendar', 'contact']]

    def __str__(self):
        return f"{self.contact.username} added to Calendar {self.calendar.name} submitted {self.has_submitted}"

class TimeSlotVote(models.Model):
   calendar = models.ForeignKey(Calendar, on_delete=models.CASCADE)
   contact = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
   timeslot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE)
   preference = models.IntegerField(choices=(
       (0, 'Not Available'),
       (1, 'Low Preference'),
       (2, 'Medium Preference'),
       (3, 'High Preference'),
   ))


   class Meta:
       unique_together = ('contact', 'timeslot')


   def __str__(self):
       return f"Calendar: {self.calendar.name}, Contact: {self.contact.username}, Timeslot: {self.timeslot.start_date_time}, Preference: {self.preference}"

class Notification(models.Model):
    calendar = models.ForeignKey(Calendar, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    txt = models.TextField()

    def __str__(self):
        return f"User: {self.user.username}, Calendar: {self.calendar.name}, txt: {self.txt}"
