from django.urls import path
from .views import (
    ContactListAPIView,
    ContactRequestAPIView,
)

urlpatterns = [
    # URLs for contact lists
    path('contact-lists/', ContactListAPIView.as_view(), name='contact-list'),
    
    # URLs for contact requests
    path('contact-requests/', ContactRequestAPIView.as_view(), name='contact-request'),
]
