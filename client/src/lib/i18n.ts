import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      "nav.home": "Home",
      "nav.dashboard": "Dashboard",
      "nav.payments": "Payments",
      "nav.history": "History",
      "nav.admin": "Admin",
      "nav.logout": "Logout",
      "nav.welcome": "Welcome",
      
      // Authentication
      "auth.login": "Login",
      "auth.register": "Register",
      "auth.email": "Email",
      "auth.password": "Password",
      "auth.fullName": "Full Name",
      "auth.phone": "Phone Number",
      "auth.createAccount": "Create Account",
      "auth.loginButton": "Login",
      
      // Home Page
      "home.title": "Welcome to SecureBank",
      "home.subtitle": "Your trusted partner for secure and convenient banking solutions",
      "home.features.secure.title": "Secure Banking",
      "home.features.secure.desc": "Bank-grade security with end-to-end encryption",
      "home.features.mobile.title": "Mobile Ready",
      "home.features.mobile.desc": "Access your account anywhere, anytime",
      "home.features.voice.title": "Voice Assistant",
      "home.features.voice.desc": "Banking commands with voice recognition",
      
      // Dashboard
      "dashboard.balance": "Account Balance",
      "dashboard.available": "Available Balance",
      "dashboard.account": "Account",
      "dashboard.quickActions": "Quick Actions",
      "dashboard.sendMoney": "Send Money",
      "dashboard.requestMoney": "Request Money",
      "dashboard.payBills": "Pay Bills",
      "dashboard.recentTransactions": "Recent Transactions",
      "dashboard.viewAll": "View All",
      
      // Payments
      "payments.title": "Send Payment",
      "payments.recipient": "Recipient",
      "payments.recipientPlaceholder": "Enter recipient's email",
      "payments.amount": "Amount",
      "payments.amountPlaceholder": "0.00",
      "payments.paymentMethod": "Payment Method",
      "payments.description": "Description (Optional)",
      "payments.descriptionPlaceholder": "What's this payment for?",
      "payments.security": "Security Verification",
      "payments.pin": "Transaction PIN",
      "payments.otp": "OTP",
      "payments.sendOtp": "Send OTP",
      "payments.submit": "Send Payment Securely",
      
      // History
      "history.title": "Transaction History",
      "history.allTransactions": "All Transactions",
      "history.paymentsSent": "Payments Sent",
      "history.paymentsReceived": "Payments Received",
      "history.withdrawals": "Withdrawals",
      "history.totalSent": "Total Sent",
      "history.totalReceived": "Total Received",
      "history.netBalance": "Net Balance",
      "history.totalTransactions": "Total Transactions",
      "history.detailedHistory": "Detailed History",
      
      // Admin
      "admin.title": "Admin Panel",
      "admin.totalUsers": "Total Users",
      "admin.dailyTransactions": "Daily Transactions",
      "admin.totalVolume": "Total Volume",
      "admin.activeSessions": "Active Sessions",
      "admin.userManagement": "User Management",
      "admin.allTransactions": "All Transactions",
      "admin.systemSettings": "System Settings",
      
      // Voice Assistant
      "voice.title": "Voice Assistant",
      "voice.listening": "Say a command like \"Show my balance\" or \"Make a payment\"",
      "voice.stop": "Stop Listening",
      "voice.close": "Close",
      
      // Common
      "common.loading": "Loading...",
      "common.error": "Error",
      "common.success": "Success",
      "common.cancel": "Cancel",
      "common.save": "Save",
      "common.edit": "Edit",
      "common.delete": "Delete",
      "common.status": "Status",
      "common.date": "Date",
      "common.amount": "Amount",
      "common.description": "Description",
      "common.active": "Active",
      "common.inactive": "Inactive",
      "common.completed": "Completed",
      "common.pending": "Pending",
      "common.failed": "Failed",
    }
  },
  kn: {
    translation: {
      // Navigation - Kannada
      "nav.home": "ಮನೆ",
      "nav.dashboard": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
      "nav.payments": "ಪಾವತಿಗಳು",
      "nav.history": "ಇತಿಹಾಸ",
      "nav.admin": "ನಿರ್ವಹಣೆ",
      "nav.logout": "ಲಾಗ್‌ಔಟ್",
      "nav.welcome": "ಸ್ವಾಗತ",
      
      // Authentication - Kannada
      "auth.login": "ಲಾಗಿನ್",
      "auth.register": "ನೋಂದಣಿ",
      "auth.email": "ಇಮೇಲ್",
      "auth.password": "ಪಾಸ್‌ವರ್ಡ್",
      "auth.fullName": "ಪೂರ್ಣ ಹೆಸರು",
      "auth.phone": "ದೂರವಾಣಿ ಸಂಖ್ಯೆ",
      "auth.createAccount": "ಖಾತೆ ರಚಿಸಿ",
      "auth.loginButton": "ಲಾಗಿನ್",
      
      // Home Page - Kannada
      "home.title": "ಸೆಕ್ಯೂರ್‌ಬ್ಯಾಂಕ್‌ಗೆ ಸ್ವಾಗತ",
      "home.subtitle": "ಸುರಕ್ಷಿತ ಮತ್ತು ಅನುಕೂಲಕರ ಬ್ಯಾಂಕಿಂಗ್ ಪರಿಹಾರಗಳಿಗಾಗಿ ನಿಮ್ಮ ವಿಶ್ವಾಸಾರ್ಹ ಪಾಲುದಾರ",
      "home.features.secure.title": "ಸುರಕ್ಷಿತ ಬ್ಯಾಂಕಿಂಗ್",
      "home.features.secure.desc": "ಎಂಡ್-ಟು-ಎಂಡ್ ಎನ್‌ಕ್ರಿಪ್ಶನ್‌ನೊಂದಿಗೆ ಬ್ಯಾಂಕ್-ಗ್ರೇಡ್ ಭದ್ರತೆ",
      "home.features.mobile.title": "ಮೊಬೈಲ್ ಸಿದ್ಧ",
      "home.features.mobile.desc": "ಎಲ್ಲಿ ಬೇಕಾದರೂ, ಯಾವಾಗ ಬೇಕಾದರೂ ನಿಮ್ಮ ಖಾತೆಯನ್ನು ಪ್ರವೇಶಿಸಿ",
      "home.features.voice.title": "ಧ್ವನಿ ಸಹಾಯಕ",
      "home.features.voice.desc": "ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆಯೊಂದಿಗೆ ಬ್ಯಾಂಕಿಂಗ್ ಕಮಾಂಡ್‌ಗಳು",
      
      // Other translations...
      "common.loading": "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
      "common.error": "ದೋಷ",
      "common.success": "ಯಶಸ್ಸು",
      "common.cancel": "ರದ್ದುಗೊಳಿಸಿ",
      "common.save": "ಉಳಿಸಿ",
    }
  },
  hi: {
    translation: {
      // Navigation - Hindi
      "nav.home": "होम",
      "nav.dashboard": "डैशबोर्ड",
      "nav.payments": "भुगतान",
      "nav.history": "इतिहास",
      "nav.admin": "एडमिन",
      "nav.logout": "लॉगआउट",
      "nav.welcome": "स्वागत",
      
      // Authentication - Hindi
      "auth.login": "लॉगिन",
      "auth.register": "रजिस्टर",
      "auth.email": "ईमेल",
      "auth.password": "पासवर्ड",
      "auth.fullName": "पूरा नाम",
      "auth.phone": "फ़ोन नंबर",
      "auth.createAccount": "खाता बनाएं",
      "auth.loginButton": "लॉगिन",
      
      // Home Page - Hindi
      "home.title": "सिक्यूरबैंक में आपका स्वागत है",
      "home.subtitle": "सुरक्षित और सुविधाजनक बैंकिंग समाधानों के लिए आपका विश्वसनीय साझेदार",
      "home.features.secure.title": "सुरक्षित बैंकिंग",
      "home.features.secure.desc": "एंड-टू-एंड एन्क्रिप्शन के साथ बैंक-ग्रेड सुरक्षा",
      "home.features.mobile.title": "मोबाइल तैयार",
      "home.features.mobile.desc": "कहीं भी, कभी भी अपने खाते तक पहुंच",
      "home.features.voice.title": "वॉयस असिस्टेंट",
      "home.features.voice.desc": "वॉयस रिकग्निशन के साथ बैंकिंग कमांड",
      
      // Other translations...
      "common.loading": "लोड हो रहा है...",
      "common.error": "त्रुटि",
      "common.success": "सफलता",
      "common.cancel": "रद्द करें",
      "common.save": "सेव करें",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
