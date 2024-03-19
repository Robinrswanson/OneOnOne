from django.db import models
from django.conf import settings

# Create your models here.
class Calendar(models.Model):
    name = models.CharField(max_length=120)
    comment = models.TextField(max_length=200, blank=True)
    date_time_created = models.DateTimeField(auto_now_add=True)
    date_time_modified = models.DateTimeField(auto_now=True)
    date_time_finalization = models.DateTimeField()
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.id} {self.name}"

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
