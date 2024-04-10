from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
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

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # First, get the original response which includes the access and refresh tokens
        data = super().validate(attrs)

        # Add additional user data to the response
        # Here, you can customize this to include any information you need
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
        }
        
        return data