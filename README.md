# LuxeHair Appointment Booking App

A full-stack booking platform that allows clients to easily book services, make payments, and manage their appointments — while providing an admin dashboard for managing services, categories, and client bookings.

---

## 🚀 Features

### **Authentication & User Management**
- **User Registration** via email with token-based verification  
- **Email Verification** before account activation  
- **Secure Login & Logout** functionality  
- **Protected Routes** for authenticated users only  

### **Services & Categories**
- View **all service categories**  
- View **services** under each category  
- Dynamic data fetched from the backend  

### **Appointments**
- **Book appointments** for available time slots  
- Prevent double bookings (slots already taken are blocked)  
- **Reschedule** appointments with updated availability checks  
- **Cancel appointments** (with status tracking)  

### **Payments**
- **Stripe integration** for secure online payments  
- **Paystack integration** (supporting local payment methods)  
- Backend webhook integration to confirm payment status  

### **Dashboards**
- **Client Dashboard**
  - View upcoming and past appointments
  - Reschedule or cancel bookings
  - Track payment status
- **Admin Dashboard**
  - Manage service categories & services
  - View all appointments
  - Update booking statuses

### **Email Notifications**
- **Booking Confirmation** sent to both client and admin  
- **Reschedule Notification** sent to both client and admin  
- **Cancellation Notification** sent to both client and admin  

---

## 🛠 Tech Stack

### **Frontend**
- React.js  
- TailwindCSS  
- React Hook Form  

### **Backend**
- Django & Django REST Framework  
- PostgreSQL (or MySQL)  
- Stripe & Paystack APIs  
- Django Email Backend (SMTP)  

---

## 📦 Installation

### **1. Clone the repository**
```bash
git clone https://github.com/yourusername/booking-app.git
cd booking-app
```

### **2. Backend Setup**
```bash
cd backend
python -m venv env
source env/bin/activate  # Windows: env\scripts\activate
pip install -r requirement.txt
python manage.py migrate
python manage.py runserver
```

### **3. Frontend Setup**
```bash
cd ../frontend
npm install
npm run dev
```

## 🔑 Environment Variables
Create a .env file in the backend and frontend folders with:

### **Backend**
EMAIL=youremail
PASSWORD=youremailpassoword(orapppassword)
SECRET_KEY=yoursecretkey
PAYSTACK_SECRET_KEY=yourpaystacksecretkey
PAYSTACK_PUBLIC_KEY=yourpaystackpubkey
STRIPE_SECRET_KEY=yourstripesecretkey
STRIPE_PUB_KEY=yourstripepubkey

### **Frontend**
VITE_API_URL="http://127.0.0.1:8000/api/v1/"


## License
This project is licensed under the MIT License
