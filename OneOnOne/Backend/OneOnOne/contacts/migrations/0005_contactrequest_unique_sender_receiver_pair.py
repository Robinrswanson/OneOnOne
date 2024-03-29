# Generated by Django 5.0.3 on 2024-03-12 20:46

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('contacts', '0004_remove_contactrequest_unique_sender_receiver_pair'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddConstraint(
            model_name='contactrequest',
            constraint=models.UniqueConstraint(fields=('sender', 'receiver'), name='unique_sender_receiver_pair'),
        ),
    ]
