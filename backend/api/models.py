from django.db import models
from django.conf import settings
from django.contrib.auth.models import (
    AbstractBaseUser, BaseUserManager, PermissionsMixin)

from rest_framework_simplejwt.tokens import RefreshToken
from django.utils.text import slugify
from datetime import timedelta
import uuid

# Create your models here.


class UserManager(BaseUserManager):
    def create_user(self, full_name, email, password=None):
        if full_name is None:
            raise TypeError('Users must have a full name')
        if email is None:
            raise TypeError('Users must have an Email')
        
        user = self.model(full_name=full_name, email=self.normalize_email(email))
        user.set_password(password)
        user.save()
        return user
    
    def create_superuser(self, full_name, email, password=None):
        if password is None:
            raise TypeError('Password should not be none')
        
        user = self.create_user(full_name, email, password)
        user.is_superuser = True
        user.is_staff = True
        user.save()
        return user
    


class User(AbstractBaseUser, PermissionsMixin):
    full_name = models.CharField(max_length=255, db_index=True)
    email = models.EmailField(max_length=255, unique=True, db_index=True)
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    objects = UserManager()

    def __str__(self):
        return self.email
    
    def tokens(self):
        refresh = RefreshToken.for_user(self)
        refresh['email'] = self.email
        refresh['full_name'] = self.full_name
        refresh['is_staff'] = self.is_staff
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token)
        }


class Category(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    slug = models.SlugField(unique=True, null=True, blank=True)

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = "Categories"
    
    def save(self, *args, **kwargs):
        if self.slug == "" or self.slug == None:
            self.slug = slugify(self.name)
        super(Category, self).save(*args, **kwargs)


class Service(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration = models.DurationField()
    slug = models.SlugField(unique=True, null=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='services')
    image = models.FileField(upload_to='service-images/', blank=True, null=True)

    class Meta:
        verbose_name_plural = "Services"

    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if self.slug == "" or self.slug == None:
            self.slug = slugify(self.name)
        super(Service, self).save(*args, **kwargs)


class Appointment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="appointments")
    services = models.ManyToManyField('Service')
    client_phone = models.CharField(max_length=20, blank=True, null=True)
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # is_paid = models.BooleanField(default=False)
    is_rescheduled = models.BooleanField(default=False)
    is_cancelled = models.BooleanField(default=False)
    payment_reference = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"Appointment for {self.user.full_name} on {self.appointment_date} at {self.appointment_time}"

    def total_price(self):
        return sum(service.price for service in self.services.all())
    
    def total_duration(self):
        total = sum((service.duration for service in self.services.all()), timedelta())
        return total