from rest_framework import serializers
from .models import UserData
from contacts.models import ContactList

class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserData
        fields = ["id", "username", "email", "first_name", "last_name", "password"]

    def create(self, validated_data):
        user = UserData.objects.create(username=validated_data['username'],
                                       email=validated_data['email'],
                                       first_name=validated_data['first_name'],
                                       last_name=validated_data['last_name'])
        user.set_password(validated_data['password'])
        user.save()

        # Initialize a new contact list on creation of a new user
        ContactList.objects.create(user=user)

        return user
    
class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserData
        fields = ["id", "username", "email", "first_name", "last_name", "password"]
        extra_kwargs = {
            'username': {'required': False},
            'email': {'required': False},
            'first_name': {'required': False},
            'last_name': {'required': False},
            'password': {'required': False}
        }