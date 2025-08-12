from django.urls import path
from . import views as api_views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # authentication
    path('auth/token/refresh/', TokenRefreshView.as_view(), name="token-refresh"),
    path('auth/register/', api_views.RegisterAPIView.as_view(), name="register"),
    path('auth/email-verify/', api_views.VerifyUser.as_view(), name='email-verify'),
    path('auth/login/', api_views.LoginAPIView.as_view(), name='login'),

    # categories
    path('categories/', api_views.CategoryListAPIView.as_view(), name="category-list"),
    path('categories/<slug:slug>/', api_views.CategoryDetailAPIView.as_view(), name='category-detail'),

    # services
    path('services/', api_views.ServiceListAPIView.as_view(), name='service-list'),

    # appointments
    path('appointments/', api_views.AppointmentCreateAPIView.as_view(), name="appointment-create"),
    path('appointments/my/', api_views.UserAppointmentsAPIView.as_view(), name="my-appointments"),
    path('appointments/<int:pk>/', api_views.AppointmentRetrieveUpdateDestroyAPIView.as_view(), name='appointment-detail'),
    path('appointments/<int:pk>/update/', api_views.AppointmentUpdateAPIView.as_view(), name='appointment-update'),
    path('appointments/admin/', api_views.AdminAppointmentsAPIView.as_view(), name="admin-appointment-view"),
    path('appointments/booked-slots/', api_views.BookedSlotsAPIView.as_view(), name='booked-slots'),

    # paystack
    path('initialize-payment/', api_views.InitializePaystackAPIView.as_view(), name="paystack-payment"),
    path('verify-payment/', api_views.VerifyPaymentAPIView.as_view(), name="verify-paystack-payment"),
    path("initialize-stripe-payment/", api_views.InitializeStripePaymentAPIView.as_view(), name="stripe-payment"),
    path("verify-stripe-payment/", api_views.VerifyStripePaymentView.as_view(), name="verify-stripe-payment"),
]