from django.db import models
from django.conf import settings

class ContactList(models.Model):

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="user")
    contacts = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, related_name="contacts")

    def __str__(self):
        return self.user.username
    
    def add_contact(self, account):
        """
        Add a new contact
        """
        if account not in self.contacts.all():
            self.contacts.add(account)

    def remove_contact(self, account):
        """
        Remove a contact
        """
        if account in self.contacts.all():
            self.contacts.remove(account)

    def unadd(self, removee):
        """
        Initaiate the action of removing a contact.
        """
        remover_contacts_list = self # Person terminating the contact

        # Remove contact from remover contact list
        remover_contacts_list.remove_contact(removee)

        # Remove contact from removee contact list
        contacts_list = ContactList.objects.get(user=removee)
        contacts_list.remove_contact(self.user)

class ContactRequest(models.Model):
    """
    A contact request consistes of two main parts:
    1. SENDER:
        - Person sending/initiating the contact request
    2. RECIEVER:
        - Person receiving the contact request
    """

    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sender")
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="receiver")

    is_active = models.BooleanField(blank=True, null=False, default=True)

    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.sender.username

    def accept(self):
        """
        Accept a contact request.
        Update both SENDER and RECEIVER contact lists
        """
        receiver_contact_list = ContactList.objects.get(user=self.receiver)
        if receiver_contact_list:
            receiver_contact_list.add_contact(self.sender)
            sender_contact_list = ContactList.objects.get(user=self.sender)
            if sender_contact_list:
                sender_contact_list.add_contact(self.receiver)
                self.is_active = False
                self.save()
    
    def decline(self):
        """
        Decline a contact request.
        It is "declined" by setting the 'is_active' field to False
        """
        self.is_active = False
        self.save()

    def cancel(self):
        """
        Contact a contact request.
        It is "cancelled" by setting the 'is_active' field to False
        This is only different with respect to "declining" through the notification that is generated.
        """
        self.is_active = False
        self.save()