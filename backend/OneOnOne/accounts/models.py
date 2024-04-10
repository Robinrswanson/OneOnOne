from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from contacts.models import ContactList


class UserManager(BaseUserManager):

    use_in_migration = True

    def create_user(self, username, email, first_name, last_name, password=None, **extra_fields):
        if not username:
            raise ValueError('Users must have a username.')
        if not email:
            raise ValueError('Users must have a email.')
        if not first_name:
            raise ValueError('Users must have a first name.')
        if not last_name:
            raise ValueError('Users must have a last name.')
        user = self.model(username=username, email=self.normalize_email(email), first_name=first_name, last_name=last_name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)

        ContactList.objects.create(user=user)

        return user

    def create_superuser(self, username, email, password, first_name, last_name, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff = True')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser = True')

        return self.create_user(username=username, email=self.normalize_email(email), first_name=first_name, last_name=last_name, password=password, **extra_fields)


class UserData(AbstractUser):

    username = models.CharField(max_length=120, unique=True)
    email = models.EmailField(verbose_name="email", max_length=100, unique=True)
    first_name = models.CharField(max_length=120)
    last_name = models.CharField(max_length=120)
    date_joined = models.DateTimeField(verbose_name="date joined", auto_now_add=True)
    last_login = models.DateTimeField(verbose_name="last login", auto_now=True)
    
    is_admin = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', 'first_name', 'last_name']

    def __str__(self):
        return self.username
    
    def set_password(self, raw_password: str | None) -> None:
        return super().set_password(raw_password)