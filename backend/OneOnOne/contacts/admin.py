from django.contrib import admin
from .models import ContactList, ContactRequest

class ContactListAdmin(admin.ModelAdmin):
    list_filter = ['user']
    list_display = ['user']
    search_fields = ['user']
    readonly_fields = ['user']

    class Meta:
        model = ContactList

admin.site.register(ContactList, ContactListAdmin)

class ContactRequestAdmin(admin.ModelAdmin):
    list_filter = ['sender', 'receiver']
    list_display = ['sender', 'receiver']
    search_fields = ['sender__username', 'sender__email', 'receiver__username', 'receiver__email']

    class Meta:
        model = ContactRequest
    
admin.site.register(ContactRequest, ContactRequestAdmin)
