# Generated by Django 5.0.3 on 2024-03-08 01:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0002_remove_userdata_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userdata',
            name='username',
            field=models.CharField(max_length=120, unique=True),
        ),
    ]
