# Activities Subscriptions Frontend Module

This module provides a complete frontend interface for the Activities Subscriptions system, following a modular design with clean, minimal UI components that match the existing app's color theme.

## 🎨 Design Features

- **Consistent Color Theme**: Uses the existing app's brown/beige color scheme
- **Minimal Design**: Clean, uncluttered interface focusing on functionality
- **Responsive Layout**: Works seamlessly across desktop, tablet, and mobile devices
- **Dark Mode Support**: Full dark mode compatibility
- **Modular Architecture**: Reusable components following DDD principles

## 📱 Screens Overview

### Cashier Screens
1. **Subscription Management** - Create and manage subscriptions, generate QR codes
2. **QR Check-in** - Scan QR codes for attendance tracking

### Admin Screens
1. **Academy Management** - Manage academy contracts and revenue sharing
2. **Offer Management** - Create and manage activity offers with pricing

## 🧩 Component Structure

```
components/activitiesSubscriptions/
├── ActivitiesSubscriptions.jsx          # Main container component
├── cashier/
│   ├── SubscriptionManagement/          # Subscription CRUD operations
│   └── QRCheckIn/                       # QR scanning interface
├── admin/
│   ├── AcademyManagement/               # Academy management
│   └── OfferManagement/                 # Offer management
├── shared/
│   ├── FormField/                       # Reusable form inputs
│   ├── Modal/                           # Modal dialogs
│   ├── DataTable/                       # Data display tables
│   └── QRScanner/                       # QR code scanner
└── index.js                             # Component exports
```

## 🎯 Key Features

### Subscription Management
- Create new subscriptions with subscriber/offer selection
- Generate encrypted QR codes for each subscription
- View subscription status and remaining balance
- Comprehensive validation and error handling

### QR Check-in System
- Camera-based QR code scanning
- Manual QR code input fallback
- Real-time attendance tracking
- Success/error feedback with visual indicators

### Academy Management
- Create and edit academy contracts
- Revenue sharing percentage management (must total 100%)
- Working days configuration
- Status management (active/inactive)

### Offer Management
- Flexible offer types (class-based or hourly)
- Multi-tier pricing (infantry, civilian, other)
- Duration and availability configuration
- Comprehensive form validation

## 🎨 UI Components

### FormField
- Supports text, select, checkbox, textarea, and number inputs
- Built-in validation and error display
- Consistent styling across all forms

### DataTable
- Sortable columns with loading states
- Action buttons for each row
- Empty state handling
- Responsive design

### Modal
- Multiple sizes (small, medium, large, fullscreen)
- Backdrop click to close
- Consistent header with close button

### QRScanner
- Camera integration with fallback
- Visual scanning overlay
- Manual input option
- Error handling for camera permissions

## 🎨 Color Scheme

The module uses the existing app's color variables:

- **Primary Brown**: `var(--brown-color)` - #803D3B
- **Beige**: `var(--beige-color)` - #AF8260
- **Light Beige**: `var(--light-beige-color)` - #E4C59E
- **Success**: Green variants for success states
- **Error**: Red variants for error states
- **Warning**: Orange variants for warnings

## 📱 Responsive Design

- **Desktop**: Full feature set with optimal layout
- **Tablet**: Adjusted spacing and touch-friendly controls
- **Mobile**: Stacked layouts, simplified navigation

## 🌙 Dark Mode Support

All components automatically adapt to dark mode using CSS custom properties:
- Background colors switch to dark variants
- Text colors adjust for readability
- Border colors adapt to dark theme
- Status badges use dark mode variants

## 🚀 Usage

```jsx
import { ActivitiesSubscriptions } from './components/activitiesSubscriptions';

function App() {
  return (
    <div className="app">
      <ActivitiesSubscriptions />
    </div>
  );
}
```

## 🔧 API Integration

The module integrates with the backend API through:
- `apis/activitiesSubscriptions/index.js` - Complete API client
- Error handling with user-friendly messages
- Loading states for better UX
- Optimistic updates where appropriate

## 📋 Form Validation

- Client-side validation for immediate feedback
- Server-side error display
- Required field indicators
- Custom validation rules (e.g., revenue shares must total 100%)

## 🎯 User Roles

- **Cashier**: Access to subscription management and QR check-in
- **Admin**: Full access to all management screens
- Role-based navigation (can be extended)

## 🔮 Future Enhancements

- Real-time notifications for check-ins
- Advanced reporting and analytics
- Mobile app integration
- Offline support for QR scanning
- Advanced search and filtering
- Bulk operations for subscriptions
