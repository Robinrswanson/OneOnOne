# Generated by Django 5.0.3 on 2024-03-08 19:26

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0003_alter_userdata_username'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userdata',
            name='date_joined',
            field=models.DateTimeField(auto_now_add=True, verbose_name='date joined'),
        ),
        migrations.AlterField(
            model_name='userdata',
            name='email',
            field=models.EmailField(max_length=100, unique=True, verbose_name='email'),
        ),
        migrations.AlterField(
            model_name='userdata',
            name='first_name',
            field=models.CharField(max_length=120),
        ),
        migrations.AlterField(
            model_name='userdata',
            name='last_login',
            field=models.DateTimeField(auto_now=True, default=django.utils.timezone.now, verbose_name='last login'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='userdata',
            name='last_name',
            field=models.CharField(max_length=120),
        ),
    ]
