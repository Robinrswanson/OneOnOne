from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import ContactList, ContactRequest
from .serializers import ContactListSerializer, ContactRequestSerializer, UserDetailSerializer
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
        if user.is_anonymous or not get_user_model().objects.filter(pk=user.pk).exists():
            return Response({'error': 'User does not exist.'}, status=status.HTTP_404_NOT_FOUND)
        contact_list = ContactList.objects.get(user=user.id)
        serializer = ContactListSerializer(contact_list)
        return Response(serializer.data)
    
    def put(self, request):
        '''
        Remove a contact from the contact list.
        '''
        user = request.user
        if user.is_anonymous or not get_user_model().objects.filter(pk=user.pk).exists():
            return Response({'error': 'User does not exist.'}, status=status.HTTP_404_NOT_FOUND)
        contact_list = ContactList.objects.get(user=user)
        contact_email = request.data.get('email')
        if contact_email:
            if  get_user_model().objects.filter(email=contact_email).exists():
                removee = get_user_model().objects.get(email=contact_email)
            else:
                return Response({'error': 'User does not exist'}, status=status.HTTP_404_NOT_FOUND)
            if removee in contact_list.contacts.all():
                print(removee)
                contact_list.unadd(removee)
                print(contact_list.contacts)
                contact_list.save()
                return Response({'message': 'Sucessfully removed user from contact list'}, status=status.HTTP_204_NO_CONTENT)
            else:
                return Response({'error': 'User not in contact list.'}, status=status.HTTP_404_NOT_FOUND)
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
        user = request.user
        if user.is_anonymous or not get_user_model().objects.filter(pk=user.pk).exists():
            return Response({'error': 'User does not exist.'}, status=status.HTTP_404_NOT_FOUND)
        incoming_requests = ContactRequest.objects.filter(receiver=user, is_active=True)
        serializer = ContactRequestSerializer(incoming_requests, many=True)
        return Response(serializer.data)

    def post(self, request):
        """
        Create a new contact request.
        """
        sender = request.user
        if sender.is_anonymous or not get_user_model().objects.filter(pk=sender.pk).exists():
            return Response({'error': 'Sender does not exist.'}, status=status.HTTP_404_NOT_FOUND)
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

    def put(self, request, *args, **kwargs):
        contact_request_id = request.data.get('id')  # Get the ID from the request body
        action = request.data.get('action')  # 'accept' or 'decline'

        try:
            contact_request = ContactRequest.objects.get(pk=contact_request_id)
        except ContactRequest.DoesNotExist:
            return Response({'error': 'Contact request does not exist'}, status=status.HTTP_404_NOT_FOUND)

        # Check if the authenticated user is the receiver of the contact request
        if request.user != contact_request.receiver:
            raise PermissionDenied("You are not authorized to perform this action.")

        if not contact_request.is_active:
            return Response({'error': 'Contact request inactive'}, status=status.HTTP_400_BAD_REQUEST)

        if action == 'accept':
            # Assuming accept method updates the contact request to reflect acceptance
            contact_request.accept()

            # Assuming the sender is an instance of the user model and you want to return user details
            sender = contact_request.sender
            sender_details = UserDetailSerializer(sender).data  # Serialize sender details

            return Response({'message': 'Contact request accepted', 'sender': sender_details}, status=status.HTTP_200_OK)
        elif action == 'decline':
            # Assuming decline method updates the contact request to reflect rejection
            contact_request.decline()

            return Response({'message': 'Contact request declined'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)


    # def delete(self, request, pk):
    #     """
    #     Delete an existing contact request.
    #     """
    #     try:
    #         contact_request = ContactRequest.objects.get(pk=pk)
    #     except ContactRequest.DoesNotExist:
    #         Response({'error': 'Contact request does not exist'}, status=status.HTTP_404_NOT_FOUND)
    #     contact_request.delete()
    #     return Response(status=status.HTTP_204_NO_CONTENT)
    