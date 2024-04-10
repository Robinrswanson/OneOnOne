from rest_framework import serializers
from .models import ContactList, ContactRequest
from django.contrib.auth import get_user_model

User = get_user_model()

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email']

class ContactListSerializer(serializers.ModelSerializer):
    contacts = CustomUserSerializer(many=True, read_only=True)

    class Meta:
        model = ContactList
        fields = ['user', 'contacts']
        read_only_fields = ['user', 'contacts']

class ContactRequestSerializer(serializers.ModelSerializer):
    sender_details = serializers.SerializerMethodField()

    class Meta:
        model = ContactRequest
        fields = ['id', 'sender', 'receiver', 'sender_details']
    
    def get_sender_details(self, obj):
        """Retrieve the sender's email, first name, and last name."""
        user = obj.sender
        return UserDetailSerializer(user).data

class UserDetailSerializer(serializers.ModelSerializer):
    """Serializer to fetch user details."""
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name']