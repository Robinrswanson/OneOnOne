from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import ContactList, ContactRequest
from .serializers import ContactListSerializer, ContactRequestSerializer
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError, PermissionDenied

class ContactListAPIView(APIView):
    """
    API view to handle operations on individual contact lists.
    """
    def get(self, request):
        """
        Retrieve a specific contact list by its primary key.
        """
        user = request.user
        contact_list = ContactList.objects.get(user=user.id)
        serializer = ContactListSerializer(contact_list)
        return Response(serializer.data)
    
    def put(self, request):
        '''
        Remove a contact from the contact list.
        '''
        contact_list = ContactList.objects.get(user=request.user)
        contact_email = request.data.get('email')
        if contact_email:
            removee = get_user_model().objects.get(email=contact_email)
            if not removee:
                Response({'error': 'User does not exist'}, status=status.HTTP_404_NOT_FOUND)
            contact_list.unadd(removee)
            return Response({'message': 'Sucessfully removed user from contact list'}, status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'error': 'Missing email'}, status=status.HTTP_400_BAD_REQUEST)

class ContactRequestAPIView(APIView):
    """
    API view to handle operations on individual contact requests.
    """
    def get(self, request):
        """
        Retrieve a specific contact request by its primary key
        or retrieve all incoming contact requests for the current user.
        """
        incoming_requests = ContactRequest.objects.filter(receiver=request.user, is_active=True)
        serializer = ContactRequestSerializer(incoming_requests, many=True)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data)

    def post(self, request):
        """
        Create a new contact request.
        """
        sender = request.user
        receiver_username = request.data.get('receiver')

        if sender.username == receiver_username:
            raise ValidationError("You cannot send a contact request to yourself.")

        try:
            receiver = get_user_model().objects.get(username=receiver_username)
        except get_user_model().DoesNotExist:
            raise ValidationError("Receiver user does not exist.")
        
        if ContactRequest.objects.filter(sender=sender, receiver=receiver).exists():
            raise ValidationError("You have already sent a friend request to this user.")
        
        if ContactRequest.objects.filter(sender=receiver, receiver=sender).exists():
            ContactRequest.objects.get(sender=receiver, receiver=sender).accept()
            return Response({'message': 'Friend request accepted.'}, status=status.HTTP_200_OK)

        serializer = ContactRequestSerializer(data={'sender': sender.pk, 'receiver': receiver.pk})
        
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def put(self, request):
        """
        Accept or Decline an existing contact request.
        """
        contact_request_id = request.data.get('id')  # Get the ID from the request body
        contact_request = ContactRequest.objects.get(pk=contact_request_id)
        if not contact_request:
            Response({'error': 'Contact request does not exist'}, status=status.HTTP_404_NOT_FOUND)

        # Check if the authenticated user is the receiver of the contact request
        if request.user != contact_request.receiver:
            raise PermissionDenied("You are not authorized to perform this action.")

        action = request.data.get('action')  # 'accept' or 'decline'

        if action == 'accept':
            contact_request.accept()
        elif action == 'decline':
            contact_request.decline()
        else:
            return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

        return Response(status=status.HTTP_204_NO_CONTENT)


    def delete(self, request, pk):
        """
        Delete an existing contact request.
        """
        contact_request = ContactRequest.objects.get(pk=pk)
        if not contact_request:
            Response({'error': 'Contact request does not exist'}, status=status.HTTP_404_NOT_FOUND)
        contact_request.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
