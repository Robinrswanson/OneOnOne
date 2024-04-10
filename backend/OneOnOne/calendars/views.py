from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import TimeSlot, Calendar, CalendarContact, TimeSlotVote, Notification
from .serializers import CalendarSerializer, TimeSlotSerializer, CalendarContactSerializer, TimeSlotVoteSerializer, NotificationSerializer
from django.http import Http404, HttpResponse, JsonResponse
from django.core.exceptions import PermissionDenied
from contacts.serializers import CustomUserSerializer
from django.shortcuts import get_object_or_404, get_list_or_404
from contacts.models import ContactList
from django.conf import settings
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.db.models import Prefetch
from django.db.models import Sum, Count, Q, F



class CalendarListPrimary(APIView):
    """
    List all calendars you own or Create a new calendar.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, **kwargs):
        calendars = Calendar.objects.filter(owner=request.user)
        serializer = CalendarSerializer(calendars, many=True)

        for calendar in calendars:
            if calendar.status != 'finalized':
                calendar.update_submission_status()

        return Response(serializer.data)

    def post(self, request, **kwargs):
        serializer = CalendarSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(owner=request.user, status='submitted')
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
class CalendarListSecondary(APIView):
    """
    List all calendars you are a part of as an added contact.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, **kwargs):
        calendar_ids = CalendarContact.objects.filter(contact=request.user).values_list('calendar', flat=True)
        calendars_from_contacts = Calendar.objects.filter(id__in=calendar_ids)
        serializer = CalendarSerializer(calendars_from_contacts, many=True)

        for calendar_id in calendar_ids:
            calendar = get_object_or_404(Calendar, id=calendar_id)
            if calendar.status != 'finalized':
                calendar.update_submission_status()

        serializer_data = serializer.data
        for datapoint in serializer_data:
            calendar_id  = datapoint.get('id')
            calendar = get_object_or_404(Calendar, id=calendar_id)
            calendar_contact = CalendarContact.objects.get(calendar_id=calendar_id, contact=request.user)
            total_timeslots = TimeSlot.objects.filter(calendar=calendar).count()
            voted_timeslots = TimeSlotVote.objects.filter(calendar=calendar, contact=request.user).count()
            if total_timeslots == voted_timeslots:
                CalendarContact.objects.filter(calendar=calendar, contact=request.user).update(has_submitted=True)
                has_submitted = True
            else:
                CalendarContact.objects.filter(calendar=calendar, contact=request.user).update(has_submitted=False)
                has_submitted = False
            if calendar.status == 'finalized':
                datapoint['contact_status'] = 'finalized'
            elif has_submitted:
                datapoint['contact_status'] = 'submitted'
            else:
                datapoint['contact_status'] = 'not_submitted'
        
        calendar_ids = CalendarContact.objects.filter(contact=request.user).values_list('calendar', flat=True)
        calendars_from_contacts = Calendar.objects.filter(id__in=calendar_ids)
        serializer = CalendarSerializer(calendars_from_contacts, many=True)

        for calendar_id in calendar_ids:
            calendar = get_object_or_404(Calendar, id=calendar_id)
            if calendar.status != 'finalized':
                calendar.update_submission_status()

        serializer_data = serializer.data
        for datapoint in serializer_data:
            calendar_id  = datapoint.get('id')
            calendar = get_object_or_404(Calendar, id=calendar_id)
            calendar_contact = CalendarContact.objects.get(calendar_id=calendar_id, contact=request.user)
            total_timeslots = TimeSlot.objects.filter(calendar=calendar).count()
            voted_timeslots = TimeSlotVote.objects.filter(calendar=calendar, contact=request.user).count()
            if total_timeslots == voted_timeslots:
                CalendarContact.objects.filter(calendar=calendar, contact=request.user).update(has_submitted=True)
                has_submitted = True
            else:
                CalendarContact.objects.filter(calendar=calendar, contact=request.user).update(has_submitted=False)
                has_submitted = False
            if calendar.status == 'finalized':
                datapoint['contact_status'] = 'finalized'
            elif has_submitted:
                datapoint['contact_status'] = 'submitted'
            else:
                datapoint['contact_status'] = 'not_submitted'

        return Response(serializer.data)
    

class CalendarDetail(APIView):
    """
    Retrieve, update, or delete a calendar instance.
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            calendar = Calendar.objects.get(pk=pk)
            calendar_contact = CalendarContact.objects.filter(calendar_id=pk)
            contacts = calendar_contact.values('contact')
            contact_ids = calendar_contact.values_list('contact', flat=True)
            contacts = get_user_model().objects.filter(id__in=contact_ids)
            if calendar.owner != self.request.user and self.request.user not in contacts:
                raise PermissionDenied
            return calendar
        except Calendar.DoesNotExist:
            raise Http404

    def get(self, request, **kwargs):
        pk = self.kwargs['calendar_id']
        calendar = self.get_object(pk)
        serializer = CalendarSerializer(calendar)

        if calendar.status != 'finalized':
            calendar.update_submission_status()

        return Response(serializer.data)

    def put(self, request, **kwargs):
        pk = self.kwargs['calendar_id']
        calendar = self.get_object(pk)
        if calendar.owner != self.request.user:
            raise PermissionDenied
            
        serializer = CalendarSerializer(calendar, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, **kwargs):
        pk = self.kwargs['calendar_id']
        calendar = self.get_object(pk)
        if calendar.owner != self.request.user:
            raise PermissionDenied
        calendar.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    

class TimeSlotList(APIView):
    """
    List all time slots for a calendar or create a new time slot.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, **kwargs):
        calendar_id = self.kwargs['calendar_id']
        calendar_contact = CalendarContact.objects.filter(calendar_id=calendar_id)
        contacts = calendar_contact.values('contact')
        contact_ids = calendar_contact.values_list('contact', flat=True)
        contacts = get_user_model().objects.filter(id__in=contact_ids)
        if not Calendar.objects.filter(id=calendar_id, owner=request.user).exists() and self.request.user not in contacts:
            raise PermissionDenied
        timeslots = TimeSlot.objects.filter(calendar_id=calendar_id)
        serializer = TimeSlotSerializer(timeslots, many=True)
        return Response(serializer.data)

    def post(self, request, **kwargs):
        calendar_id = self.kwargs['calendar_id']
        if not Calendar.objects.filter(id=calendar_id, owner=request.user).exists():
            raise PermissionDenied
        serializer = TimeSlotSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(calendar=get_object_or_404(Calendar, id=calendar_id))
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TimeSlotDetail(APIView):
    """
    Retrieve, update or delete a time slot instance.
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        try:
            timeslot = TimeSlot.objects.get(pk=pk)
            calendar_contact = CalendarContact.objects.filter(calendar_id=pk)
            contacts = calendar_contact.values('contact')
            contact_ids = calendar_contact.values_list('contact', flat=True)
            contacts = get_user_model().objects.filter(id__in=contact_ids)
            if timeslot.calendar.owner != user and self.request.user not in contacts:
                raise PermissionDenied
            return timeslot
        except TimeSlot.DoesNotExist:
            raise Http404

    def get(self, request, **kwargs):
        pk = self.kwargs['timeslot_id']
        timeslot = self.get_object(pk, request.user)
        serializer = TimeSlotSerializer(timeslot)
        return Response(serializer.data)

    def put(self, request, **kwargs):
        pk = self.kwargs['timeslot_id']
        timeslot = self.get_object(pk, request.user)
        serializer = TimeSlotSerializer(timeslot, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, **kwargs):
        pk = self.kwargs['timeslot_id']
        timeslot = self.get_object(pk, request.user)
        timeslot.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    

class CalendarContactList(APIView):
    """
    List all contacts associated with calendar.
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, calendar_id, user):
        try:
            calendar = get_object_or_404(Calendar, id=calendar_id)
            calendar_contact = CalendarContact.objects.filter(calendar_id=calendar_id)
            contacts = calendar_contact.values('contact')
            

            contact_ids = calendar_contact.values_list('contact', flat=True)
            contacts = get_user_model().objects.filter(id__in=contact_ids)
            if user not in contacts and user != calendar.owner:
                raise PermissionDenied
            
            return calendar_contact
        
        except CalendarContact.DoesNotExist:
            raise Http404
        
    def get(self, request, **kwargs):
        calendar_id = self.kwargs['calendar_id']
        calendar_contacts = self.get_object(calendar_id, request.user)
        serializer = CalendarContactSerializer(calendar_contacts, many=True)

        calendar = get_object_or_404(Calendar, id=calendar_id)
        calendar_contact = CalendarContact.objects.filter(calendar_id=calendar_id)
        contact_ids = calendar_contact.values_list('contact', flat=True)
        for contact_id in contact_ids:
            total_timeslots = TimeSlot.objects.filter(calendar=calendar).count()
            voted_timeslots = TimeSlotVote.objects.filter(calendar=calendar, contact_id=contact_id).count()
            if total_timeslots == voted_timeslots:
                CalendarContact.objects.filter(calendar=calendar, contact_id=contact_id).update(has_submitted=True)
            else:
                CalendarContact.objects.filter(calendar=calendar, contact_id=contact_id).update(has_submitted=False)
        
        calendar_contacts = self.get_object(calendar_id, request.user)
        serializer_data = CalendarContactSerializer(calendar_contacts, many=True).data
        for datapoint in serializer_data:
            contact = get_object_or_404(get_user_model(), id=datapoint.get('contact'))
            datapoint['username'] = contact.username
            datapoint['email'] = contact.email

        return Response(serializer_data)
    

class CalendarContactDetail(APIView):
    """
    Retrieves a list of contacts not in the calendar already (and not the owner),
    Adds a contact to the calendar.
    """
    permission_classes = [IsAuthenticated]
    calendar = None

    def dispatch(self, request, **kwargs):
        calendar_id = self.kwargs['calendar_id']
        calendar = get_object_or_404(Calendar, id=calendar_id)
        self.calendar = calendar

        # if request.user != calendar.owner:
        #     raise PermissionDenied
        
        return super().dispatch(request, **kwargs)


    def get(self, request, **kwargs):

        if request.user != self.calendar.owner:
            raise PermissionDenied
        
        user = request.user
        calendar_id = self.kwargs['calendar_id']
        
        # list of contacts of the user
        contacts_list = get_object_or_404(ContactList, user=user)
        contacts_queryset = contacts_list.contacts.all()
        
        # IDs of contacts in the calendar
        calendar_contacts_ids = CalendarContact.objects.filter(calendar=get_object_or_404(Calendar, id=calendar_id)).values_list('contact', flat=True)
        
        # Filter out contacts that are already in the calendar or are the owner of the calendar
        available_contacts = contacts_queryset.exclude(id__in=calendar_contacts_ids).exclude(id=self.calendar.owner_id)
        
        serializer = CustomUserSerializer(available_contacts, many=True)
        return Response(serializer.data)

    def post(self, request, **kwargs):
        if request.user != self.calendar.owner:
            raise PermissionDenied
        # return Response({"cant happen bro"}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        calendar_id = self.kwargs['calendar_id']
        
        # list of contacts of the user
        contacts_list = get_object_or_404(ContactList, user=user)
        contacts_queryset = contacts_list.contacts.all()
        
        # IDs of contacts in the calendar
        calendar_contacts_ids = CalendarContact.objects.filter(calendar=get_object_or_404(Calendar, id=calendar_id)).values_list('contact', flat=True)
        
        # Filter out contacts that are already in the calendar or are the owner of the calendar
        available_contacts = contacts_queryset.exclude(id__in=calendar_contacts_ids).exclude(id=self.calendar.owner_id)

        serializer = CalendarContactSerializer(data=request.data)
        if serializer.is_valid():
            contact_username = serializer.validated_data['contact_username']
            print(contact_username)
            contact = get_object_or_404(get_user_model(), username=contact_username)
            if contact not in available_contacts:
                return Response({"Cannot add this contact"}, status=status.HTTP_400_BAD_REQUEST)

            serializer.save(calendar=get_object_or_404(Calendar, id=calendar_id), 
                            contact=contact)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class CalendarContactDelete(APIView):
    permission_classes = [IsAuthenticated]
    calendar = None

    def dispatch(self, request, **kwargs):
        calendar_id = self.kwargs['calendar_id']
        self.calendar = get_object_or_404(Calendar, id=calendar_id)
        
        return super().dispatch(request, **kwargs)

    def delete(self, request, **kwargs):
        
        if self.calendar.owner != request.user:
            raise PermissionDenied
        
        calendar_id = self.kwargs['calendar_id']
        contact_id = self.kwargs['contact_id']
        calendar = get_object_or_404(Calendar, id=calendar_id)
        contact = get_object_or_404(get_user_model(), id=contact_id)

        calendar_contact = CalendarContact.objects.filter(calendar_id=calendar_id)
        contact_ids = calendar_contact.values_list('contact', flat=True)
        contacts = get_user_model().objects.filter(id__in=contact_ids)
        
        if contact not in contacts:
            return Response({"Cannot remove contact not in Calendar"}, status=status.HTTP_400_BAD_REQUEST)
        calendar_contact = CalendarContact.objects.get(calendar=calendar, contact=contact)
        calendar_contact.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TimeSlotVoteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, **kwargs):
        calendar_id = self.kwargs['calendar_id']
        calendar = get_object_or_404(Calendar, id=calendar_id)
        user = request.user
        if not CalendarContact.objects.filter(calendar=calendar, contact=user).exists():
            return Response({"Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        timeslot_id = request.data.get('timeslot')
        timeslot = get_object_or_404(TimeSlot, id=timeslot_id)
        timeslot_vote_exists = TimeSlotVote.objects.filter(timeslot=timeslot, contact=request.user).exists()
        if timeslot_vote_exists:
            return Response({"error": "Vote already exists for this timeslot."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = TimeSlotVoteSerializer(data=request.data)

        if serializer.is_valid():
    
            serializer.save(calendar=calendar, contact=self.request.user)

            total_timeslots = TimeSlot.objects.filter(calendar=calendar).count()
            voted_timeslots = TimeSlotVote.objects.filter(calendar=calendar, contact=user).count()
            if total_timeslots == voted_timeslots:
                CalendarContact.objects.filter(calendar=calendar, contact=user).update(has_submitted=True)
            else:
                CalendarContact.objects.filter(calendar=calendar, contact=user).update(has_submitted=False)


            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    def put(self, request, **kwargs):
        calendar_id = self.kwargs['calendar_id']
        calendar = get_object_or_404(Calendar, id=calendar_id)
        user = request.user
        if not CalendarContact.objects.filter(calendar=calendar, contact=user).exists():
            return Response({"Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
        timeslot_id = request.data.get('timeslot')
        timeslot = get_object_or_404(TimeSlot, id=timeslot_id)
        timeslot_vote = get_object_or_404(TimeSlotVote, timeslot=timeslot, contact=request.user)
        timeslot_vote_exists = TimeSlotVote.objects.filter(timeslot=timeslot, contact=request.user).exists()
        if not timeslot_vote_exists:
            return Response({"error": "Vote does not already exist for this timeslot."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = TimeSlotVoteSerializer(timeslot_vote, data=request.data)

        if serializer.is_valid():
            
            serializer.save(calendar=calendar, contact=self.request.user)

            total_timeslots = TimeSlot.objects.filter(calendar=calendar).count()
            voted_timeslots = TimeSlotVote.objects.filter(calendar=calendar, contact=user).count()
            if total_timeslots == voted_timeslots:
                CalendarContact.objects.filter(calendar=calendar, contact=user).update(has_submitted=True)
            else:
                CalendarContact.objects.filter(calendar=calendar, contact=user).update(has_submitted=False)


            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CalendarTimeSlotVotesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, calendar_id):
        calendar = get_object_or_404(Calendar, id=calendar_id)
        if calendar.owner != request.user and not CalendarContact.objects.filter(calendar=calendar, contact=request.user).exists():
            return Response({"error": "You do not have permission to view this calendar"}, status=status.HTTP_403_FORBIDDEN)

        timeslots = TimeSlot.objects.filter(calendar=calendar).prefetch_related(
            Prefetch('timeslotvote_set', queryset=TimeSlotVote.objects.select_related('contact'))
        )

        data = []
        for timeslot in timeslots:
            votes = [{"contact": vote.contact.username, "preference": vote.preference} for vote in timeslot.timeslotvote_set.all()]
            data.append({
                "timeslot_id": timeslot.id,
                "start_date_time": timeslot.start_date_time,
                "votes": votes
            })

        return Response(data)
    
class CalendarFinalize(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        calendar_id = self.kwargs['calendar_id']

        # Fetch the calendar
        calendar = get_object_or_404(Calendar, pk=calendar_id)

        # Prepare the response data
        response_data = {
            "calendar_id": calendar.id,
            "calendar_name": calendar.name,
            "is_finalized": calendar.status == 'finalized',
        }

        # If the calendar is finalized, include the finalized timeslot
        if calendar.finalized_timeslot:
            timeslot = {
                "timeslot_id": calendar.finalized_timeslot.id,
                "start_date_time": calendar.finalized_timeslot.start_date_time,
                "duration": calendar.finalized_timeslot.duration,
                "comment": calendar.finalized_timeslot.comment,
            }
        else:
            timeslot = None

        response_data["finalized_timeslot"] = timeslot

        return Response(response_data, status=status.HTTP_200_OK)

    
    def post(self, request, *args, **kwargs):
        calendar_id = self.kwargs['calendar_id']
        timeslot_id = request.data.get('timeslot_id')

        # Ensure calendar and timeslot exist and are related
        calendar = get_object_or_404(Calendar, pk=calendar_id)

        # Check if the user is the owner of the calendar
        if calendar.owner != request.user:
            raise PermissionDenied("You do not have permission to finalize this calendar.")
        

        # Check if the calendar is not already finalized
        if calendar.status == 'finalized':
            return Response({"message": "This calendar is already finalized."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Use the 'timeslots' related name to check if the timeslot is one of the calendar's timeslots
        timeslot = get_object_or_404(calendar.timeslots, pk=timeslot_id)

        # Finalize the calendar
        calendar.finalized_timeslot = timeslot
        calendar.status = 'finalized'
        calendar.save()

        return Response({"message": "Calendar finalized successfully."}, status=status.HTTP_200_OK)
    
class CalendarSuggest(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        calendar_id = self.kwargs['calendar_id']
        user = request.user

        # Ensure the calendar exists and the user is the owner
        calendar = get_object_or_404(Calendar, id=calendar_id)

        if calendar.owner != user:
            raise PermissionDenied
        
        # check that calendar is submitted.
        if calendar.status == 'created':
            return Response({"message": "All users have not submitted their preferences yet."})
        if calendar.status == 'finalized':
            return Response({"message": "The calendar has already been finalized."})

        # Aggregate the total preferences for each timeslot, excluding preferences of 0 (Not Available)
        timeslot_votes = TimeSlotVote.objects.filter(
            timeslot__calendar=calendar,
            preference__gt=0
        ).values(
            'timeslot'
        ).annotate(
            # Sum of votes' preferences plus the timeslot's own preference
            total_preference=Sum('preference') + F('timeslot__preference'),
            vote_count=Count('contact', distinct=True)
        ).order_by('-total_preference')

        # Filter out timeslots where not every contact has voted
        total_contacts = calendar.calendarcontact_set.count()
        valid_timeslots = [vote for vote in timeslot_votes if vote['vote_count'] == total_contacts]

        # Fetch the timeslot details for the top 3 (or fewer) valid timeslots

        timeslot_ids = [vote['timeslot'] for vote in valid_timeslots[:3]]
        suggested_timeslots = []

        for id in timeslot_ids:
            suggested_timeslots.append(get_object_or_404(TimeSlot, id=id))


        # If there are valid suggested timeslots
        if suggested_timeslots:
            suggested_timeslots_data = [{
                "timeslot_id": ts.id,
                "start_date_time": ts.start_date_time,
                "duration": ts.duration,
                "comment": ts.comment,
                "preference": ts.preference,
                "total_preference": next((item for item in valid_timeslots if item["timeslot"] == ts.id), {}).get('total_preference', 0)
            } for ts in suggested_timeslots]
            
            message = "Suggested timeslots based on preferences." if len(suggested_timeslots) == 3 else "These are the only possible suggested timeslots."
            return Response({"message": message, "timeslots": suggested_timeslots_data})
        
        # If no valid timeslots are found
        return Response({"message": "No possible timeslots based on the criteria."})


class TimeslotsRemaining(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, calendar_id):
        calendar = get_object_or_404(Calendar, id=calendar_id)
        user = request.user

        if not CalendarContact.objects.filter(calendar=calendar, contact=user).exists() and calendar.owner != user:
            return Response({"error": "You are not authorized to access this calendar"}, status=status.HTTP_403_FORBIDDEN)

        voted_timeslot_ids = TimeSlotVote.objects.filter(calendar=calendar, contact=user).values_list('timeslot', flat=True)
        remaining_timeslots = TimeSlot.objects.filter(calendar=calendar).exclude(id__in=voted_timeslot_ids)

        serializer = TimeSlotSerializer(remaining_timeslots, many=True)
        return Response(serializer.data)


class NotificationList(APIView):
    """
    GET: gets the notifications of current user.
    POST: creates a notification for a certain user, calendar, with certain txt.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        notifications = Notification.objects.filter(user=request.user)
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)
    
    def post(self, request, *args, **kwargs):
        serializer = NotificationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class NotificationDelete(APIView):
    """
    DELETE: deletes a specified (by id) notification of current user. 
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        notification_id = self.kwargs['notification_id']
        notification = get_object_or_404(Notification, id=notification_id)
        if request.user != notification.user:
            raise PermissionDenied
        notification.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
