from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from . import models as api_models
from django.contrib import auth
from rest_framework.exceptions import AuthenticationFailed
from datetime import timedelta
from datetime import datetime
from django.utils import timezone


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = api_models.User
        fields = ['full_name', 'email', 'password', 'password2']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"Passwords": "Passwords fields did not match"})
        return attrs
    
    def create(self, validated_data):
        user = api_models.User.objects.create(
            full_name=validated_data['full_name'],
            email=validated_data['email'],
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class EmailVerificationSerializer(serializers.ModelSerializer):
    token = serializers.CharField(max_length=555)

    class Meta:
        model = api_models.User
        fields = ['token']



class LoginSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(max_length=255)
    password = serializers.CharField(max_length=255, write_only=True)
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    tokens = serializers.SerializerMethodField()

    class Meta:
        model = api_models.User
        fields = ['email', 'password', 'full_name', 'tokens']

    def get_tokens(self, obj):
        return obj.tokens()

    def validate(self, attrs):
        email = attrs.get('email', '')
        password = attrs.get('password', '')

        user = auth.authenticate(email=email, password=password)
        if not user:
            raise AuthenticationFailed('Invalid credentials')
        if not user.is_active:
            raise AuthenticationFailed('Account disabled')
        if not user.is_verified:
            raise AuthenticationFailed('Account not verified')

        self.instance = user  # important: required for SerializerMethodField to work

        return attrs



# class LoginSerializer(serializers.ModelSerializer):
#     email = serializers.EmailField(max_length=255)
#     password = serializers.CharField(max_length=255, write_only=True)
#     full_name = serializers.CharField(max_length=255, read_only=True)
#     # tokens = serializers.CharField(max_length=555, read_only=True)

#     class Meta:
#         model = api_models.User
#         fields = ['email', 'password', 'full_name', 'tokens']#

#     def validate(self, attrs):
#         email = attrs.get('email', '')
#         password = attrs.get('password', '')

#         user = auth.authenticate(email=email, password=password)
#         if not user:
#             raise AuthenticationFailed('Invalid credentials, please try again')
#         if not user.is_active:
#             raise AuthenticationFailed('Account disabled, Please contact support')
#         if not user.is_verified:
#             raise AuthenticationFailed('Account is not verified, please verify using email')
        
        
#         return {
#             'email': user.email,
#             'full_name': user.full_name,
#             'tokens': user.tokens()
#         }


class ServiceSerializer(serializers.ModelSerializer):
    category = serializers.SerializerMethodField()
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=api_models.Category.objects.all(),
        write_only=True,
        source="category"
    )

    class Meta:
        model = api_models.Service
        fields = '__all__'

    def get_category(self, obj):
        return {
            'id': obj.category.id,
            'name': obj.category.name,
            'description': obj.category.description,
        }


class CategorySerializer(serializers.ModelSerializer):
    services = serializers.SerializerMethodField()

    class Meta:
        model = api_models.Category
        fields = '__all__'

    def get_services(self, obj):
        from .serializers import ServiceSerializer  # lazy import
        services = obj.services.all()
        return ServiceSerializer(services, many=True, context=self.context).data




class AppointmentSerializer(serializers.ModelSerializer):
    services = serializers.PrimaryKeyRelatedField(
        queryset=api_models.Service.objects.all(),
        many=True,
        write_only=True,
    )
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    client_phone = serializers.CharField(required=True, max_length=20)
    payment_reference = serializers.CharField(required=False, allow_blank=True)
    clientEmail = serializers.EmailField(source='user.email', read_only=True)
    clientName = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    service_ids = ServiceSerializer(source='services', many=True, read_only=True)
    total_duration = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()


    class Meta:
        model = api_models.Appointment
        fields = ['id', 'user', 'services', 'total_price', 'total_duration', 'status', 'service_ids', 'clientEmail', 'clientName', 'appointment_date', 'client_phone', 'appointment_time', 'payment_reference', 'is_rescheduled', 'is_cancelled']
        read_only_fields = ['is_cancelled'] # might be changed 'is_rescheduled'
    
    def validate(self, attrs):
        appointment_date = attrs.get('appointment_date')
        appointment_time = attrs.get('appointment_time')
        services = attrs.get('services')
        

        # Compute end time based on total duration
        total_duration = sum((service.duration for service in services), timedelta())
        start_time = datetime.combine(appointment_date, appointment_time)
        end_time = start_time + total_duration

        overlapping = api_models.Appointment.objects.filter(
            appointment_date=appointment_date,
            is_cancelled=False
        ).exclude(user=self.context['request'].user).filter(
            appointment_time__lt=end_time.time(),
            appointment_time__gte=appointment_time
        )

        if overlapping.exists():
            raise serializers.ValidationError('This time slot overlaps with an existing appointment.')

        return attrs
    
    def get_status(self, obj):
        now = timezone.now()  # Aware datetime (UTC or your default timezone)

        appointment_datetime = datetime.combine(obj.appointment_date, obj.appointment_time)
        appointment_datetime = timezone.make_aware(appointment_datetime)  # Make it timezone-aware

        time_diff = abs((appointment_datetime - now).total_seconds())

        if obj.is_cancelled:
            return "cancelled"
        elif obj.is_rescheduled:
            return "rescheduled"
        elif time_diff < 300:
            return "pending"
        return "confirmed"
    
    def get_total_duration(self, obj):
        # Return total duration in minutes
        total = obj.total_duration()
        return int(total.total_seconds() // 60)
    
    def get_total_price(self, obj):
        total = obj.total_price()
        return total
    
    def get_clientName(self, obj):
        return f"{obj.user.full_name}"