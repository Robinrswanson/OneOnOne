# Generated by Django 5.0.3 on 2024-03-14 20:39

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0004_alter_userdata_date_joined_alter_userdata_email_and_more'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='userdata',
            options={},
        ),
        migrations.RemoveField(
            model_name='userdata',
            name='groups',
        ),
        migrations.RemoveField(
            model_name='userdata',
            name='user_permissions',
        ),
    ]
