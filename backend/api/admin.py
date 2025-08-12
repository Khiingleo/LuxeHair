from django.contrib import admin
from django import forms

# Register your models here.
from . import models as api_models

class AppointmentAdminForm(forms.ModelForm):
    class Meta:
        model = api_models.Appointment
        fields = '__all__'
        widgets = {
            'services': forms.CheckboxSelectMultiple
        }

@admin.register(api_models.User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'full_name', 'is_verified', 'is_staff', 'created_at')
    search_fields = ('email', 'full_name')
    ordering = ('-created_at',)

@admin.register(api_models.Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(api_models.Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'duration', 'category')
    search_fields = ('name',)
    list_filter = ('category',)

@admin.register(api_models.Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    form = AppointmentAdminForm

    list_display = ('user', 'appointment_date', 'appointment_time', 'is_cancelled', 'is_rescheduled')
    list_filter = ('appointment_date', 'is_cancelled')
    search_fields = ('user__full_name', 'user__email')