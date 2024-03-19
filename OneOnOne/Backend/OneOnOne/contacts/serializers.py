from rest_framework import serializers
from .models import ContactList, ContactRequest
from django.contrib.auth import get_user_model

User = get_user_model()

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email']

class ContactListSerializer(serializers.ModelSerializer):
    contacts = CustomUserSerializer(many=True, read_only=True)

    class Meta:
        model = ContactList
        fields = ['user', 'contacts']
        read_only_fields = ['user', 'contacts']

class ContactRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactRequest
        fields = ['id', 'sender', 'receiver']
