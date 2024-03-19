from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import TimeSlot, Calendar, CalendarContact, TimeSlotVote
from .serializers import CalendarSerializer, TimeSlotSerializer, CalendarContactSerializer, TimeSlotVoteSerializer
from django.http import Http404, HttpResponse, JsonResponse
from django.core.exceptions import PermissionDenied
from contacts.serializers import CustomUserSerializer
from django.shortcuts import get_object_or_404, get_list_or_404
from contacts.models import ContactList
from django.conf import settings
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model


class CalendarListPrimary(APIView):
    """
    List all calendars you own or Create a new calendar.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, **kwargs):
        calendars = Calendar.objects.filter(owner=request.user)
        serializer = CalendarSerializer(calendars, many=True)

        return Response(serializer.data)

    def post(self, request, **kwargs):
        serializer = CalendarSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(owner=request.user)
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
        return Response(serializer.data)

    def put(self, request, **kwargs):
        pk = self.kwargs['calendar_id']
        calendar = self.get_object(pk)
        serializer = CalendarSerializer(calendar, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, **kwargs):
        pk = self.kwargs['calendar_id']
        calendar = self.get_object(pk)
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
        return Response(serializer.data)
    

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


   def post(self, request, calendar_id):
       calendar = get_object_or_404(Calendar, id=calendar_id)
       user = request.user
       if not CalendarContact.objects.filter(calendar=calendar, contact=user).exists():
           return Response({"Unauthorized"}, status=status.HTTP_403_FORBIDDEN)


       data = request.data
       data['calendar'] = calendar_id
       data['contact'] = user.id


       serializer = TimeSlotVoteSerializer(data=data)
       if serializer.is_valid():
           serializer.save()


           total_timeslots = TimeSlot.objects.filter(calendar=calendar).count()
           voted_timeslots = TimeSlotVote.objects.filter(calendar=calendar, contact=user).count()
           if total_timeslots == voted_timeslots:
               CalendarContact.objects.filter(calendar=calendar, contact=user).update(has_submitted=True)


           return Response(serializer.data, status=status.HTTP_201_CREATED)
       return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
