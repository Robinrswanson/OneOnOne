from django.forms import ValidationError
from rest_framework.views import APIView
from .serializers import UserSerializer, UserUpdateSerializer
from .models import UserData
from django.contrib.auth.password_validation import validate_password
from rest_framework.response import Response
from rest_framework import status

# view for registering users
class RegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

class ProfileView(APIView):
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        # Fetch the user instance to update
        user = request.user
        if not user:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = UserUpdateSerializer(user, data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        if 'username' in data and data['username'] and data['username'].strip() != user.username:
            if UserData.objects.filter(username=data['username']).exists():
                return Response({'error': 'Username already taken.'}, status=status.HTTP_400_BAD_REQUEST)
            user.username = data['username']

        if 'email' in data and data['email'] and data['email'].strip() != user.email:
            if UserData.objects.filter(email=data['email']).exists():
                return Response({'error': 'Email already in use.'}, status=status.HTTP_400_BAD_REQUEST)
            user.email = data['email']

        if 'first_name' in data and data['first_name'].strip():
            user.first_name = data['first_name']

        if 'last_name' in data and data['last_name'].strip():
            user.last_name = data['last_name']

        if 'password' in data and data['password'].strip():
            password = data['password']
            try:
                validate_password(password)
                user.set_password(password)
            except ValidationError as e:
                errors = list(e.messages)
                return Response({'errors': errors}, status=status.HTTP_400_BAD_REQUEST)
                    
        user.save()
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
