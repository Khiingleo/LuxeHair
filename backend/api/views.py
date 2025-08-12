from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from . import models as api_models
from . import serializers as api_serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .utils import Util
from django.contrib.sites.shortcuts import get_current_site
from django.urls import reverse
import jwt
from django.conf import settings
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from decimal import Decimal
import requests
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse
import stripe





# Create your views here.
class RegisterAPIView(generics.CreateAPIView):
    queryset = api_models.User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = api_serializers.RegisterSerializer

    def perform_create(self, serializer):
        user = serializer.save()

        token = RefreshToken.for_user(user).access_token
        # current_site = get_current_site(self.request).domain
        # relative_link = reverse('email-verify')
        frontend_url = "https://fe819b7542bd.ngrok-free.app"
        # absolute_url = f"{self.request.scheme}://{current_site}{relative_link}?token={str(token)}"
        absolute_url = f"{frontend_url}/verify-email?token={str(token)}"
        email_body = f'Hello {user.full_name}, \nPlease use the link below to verify your email:\n{absolute_url} \n\nIf this is not you please ignore this email'
        data = {
            'email_body': email_body,
            'email_to': user.email,
            'email_subject': 'verify your email',

        }

        Util.send_email(data)
    
    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        return Response(response.data, status=status.HTTP_201_CREATED)


class VerifyUser(generics.GenericAPIView):
    serializer_class = api_serializers.EmailVerificationSerializer
    permission_classes = [AllowAny]

    token_param_config = openapi.Parameter(
        'token', in_=openapi.IN_QUERY, description="enter token", type=openapi.TYPE_STRING
    )

    @swagger_auto_schema(manual_parameters=[token_param_config])
    def get(self, request):
        token = request.GET.get('token')
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            user = api_models.User.objects.get(id=payload['user_id'])
            if not user.is_verified:
                user.is_verified = True
                user.save()
            return Response({'email': 'account successfully verified'}, status=status.HTTP_200_OK)
        except jwt.ExpiredSignatureError:
            return Response({'error': 'activation link expired'}, status=status.HTTP_400_BAD_REQUEST)
        except jwt.exceptions.DecodeError:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)


class LoginAPIView(generics.GenericAPIView):
    serializer_class = api_serializers.LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


class CategoryListAPIView(generics.ListAPIView):
    serializer_class = api_serializers.CategorySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return api_models.Category.objects.all()

class ServiceListAPIView(generics.ListAPIView):
    serializer_class = api_serializers.ServiceSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return api_models.Service.objects.all()
    

class CategoryDetailAPIView(generics.RetrieveAPIView):
    queryset = api_models.Category.objects.all()
    serializer_class = api_serializers.CategorySerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

    def retrieve(self, request, *args, **kwargs):
        category = self.get_object()
        category_data = self.get_serializer(category).data
        services = api_models.Service.objects.filter(category=category)
        services_data = api_serializers.ServiceSerializer(services, many=True).data

        return Response({"category": category_data, "services": services_data}, status=status.HTTP_200_OK)


class AppointmentCreateAPIView(generics.CreateAPIView):
    serializer_class = api_serializers.AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        appointment = serializer.save()
        
        current_site = get_current_site(self.request).domain
        user = self.request.user
        services = appointment.services.all()
        service_summary = "\n".join([
            f"- {service.name} (£{service.price})" for service in services
        ])
        total_price = appointment.total_price()
        appointment_time = f"{appointment.appointment_date} at {appointment.appointment_time}"


        user_email_body = f"""
        Hello {user.full_name},

        Your appointment has been successfully booked for {appointment_time}.
        Here are the services you selected:

        {service_summary}

        Total Cost: £{total_price}
        Amount Paid(20%): £{round(total_price *  Decimal('0.2'))}

        We look forward to seeing you!

        — The Stylist Team
        """

        Util.send_email({
            'email_subject': 'Appointment Confirmation',
            'email_body': user_email_body,
            'email_to': user.email
        })


class BookedSlotsAPIView(APIView):
    permission_classes = [IsAuthenticated]  

    def get(self, request, *args, **kwargs):
        date = request.query_params.get('date')
        if not date:
            return Response({"error": "Date is required"}, status=400)

        appointments = api_models.Appointment.objects.filter(appointment_date=date, is_cancelled=False)
        booked_times = [str(appt.appointment_time) for appt in appointments]
        return Response({"booked": booked_times})


class AppointmentRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = api_models.Appointment.objects.all()
    serializer_class = api_serializers.AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Users can only access their own appointments unless admin
        user = self.request.user
        if user.is_staff:
            return api_models.Appointment.objects.all()
        return api_models.Appointment.objects.filter(user=user)


class AppointmentUpdateAPIView(generics.UpdateAPIView):
    queryset = api_models.Appointment.objects.all()
    serializer_class = api_serializers.AppointmentSerializer
    permisison_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return api_models.Appointment.objects.all()
        return api_models.Appointment.objects.filter(user=user)
    
    def perform_update(self, serializer):
        appointment = serializer.save()
        user = self.request.user
        services = appointment.services.all()
        appointment_time = f"{appointment.appointment_date} at {appointment.appointment_time}"
        service_summary = "\n".join([
            f"- {service.name} (£{service.price})" for service in services
        ])
        user_email_body = f"""
        Hello {user.full_name},

        Your Appointment:
        {service_summary}

        at: {appointment_time}
        
        Has been updated. This mail is for confirmation if you have initiatiated the change.
        If you have not please contact us.

        Thank you
        - The Stylist Team
        """
        Util.send_email({
            'email_subject': 'Appointment Confirmation',
            'email_body': user_email_body,
            'email_to': user.email
        })


class UserAppointmentsAPIView(generics.ListAPIView):
    serializer_class = api_serializers.AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return api_models.Appointment.objects.filter(user=self.request.user).order_by('-created_at')

class AdminAppointmentsAPIView(generics.ListAPIView):
    serializer_class = api_serializers.AppointmentSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return api_models.Appointment.objects.all()


class InitializePaystackAPIView(APIView):
    def post(self, request):
        email = request.data.get('email')
        amount = request.data.get('amount') # Naira
        frontend_url = "https://fe819b7542bd.ngrok-free.app"
        if not email or not amount:
            return Response({"error": "Email and amount required"}, status=400)
        
        headers = {
            "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
            "Content-Type": "application/json",
        }
        data = {
            "email": email,
            "amount": int(float(amount) * 100),  # Paystack uses Kobo
            "callback_url": f"{frontend_url}/verify-payment/"
        }

        response = requests.post("https://api.paystack.co/transaction/initialize", json=data, headers=headers)
        res_data = response.json()

        if response.status_code == 200:
            return Response(res_data['data'])  # Contains authorization_url, reference
        else:
            return Response(res_data, status=400)
        

class VerifyPaymentAPIView(APIView):
    def get(self, request):
        reference = request.query_params.get('reference')
        if not reference:
            return Response({"error": "No reference provided"}, status=400)

        headers = {
            "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}"
        }

        response = requests.get(f"https://api.paystack.co/transaction/verify/{reference}", headers=headers)
        res_data = response.json()

        if res_data['data']['status'] == 'success':
            return Response({"status": "success", "data": res_data['data']})
        return Response({"status": "failed", "data": res_data['data']}, status=400)



stripe.api_key = settings.STRIPE_SECRET_KEY
class InitializeStripePaymentAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        data = request.data
        amount = data.get("amount")
        frontend_url = "https://fe819b7542bd.ngrok-free.app"

        if not amount:
            return Response({"error": "Amount is required."}, status=400)
        
        try:
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=["card", "klarna"],
                line_items=[{
                    'price_data': {
                        'currency': 'gbp',
                        'product_data': {
                            'name': 'Appointment Booking',
                        },
                        'unit_amount': int(float(amount) * 100),
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=f'{frontend_url}/stripe-payment-success?session_id={{CHECKOUT_SESSION_ID}}',
                cancel_url=f"{frontend_url}/payment-cancelled",
                metadata={
                    "user_id": user.id,
                    "email": user.email
                }
            )
            return Response({"checkout_url": checkout_session.url})
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class VerifyStripePaymentView(APIView):
    def get(self, request):
        session_id = request.query_params.get('session_id')

        try:
            session = stripe.checkout.Session.retrieve(session_id)

            if session.payment_status == 'paid':
                return Response({'status': 'success', 'session_id': session.id})
            else:
                return Response({'status': 'failed'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'status': 'error', 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)