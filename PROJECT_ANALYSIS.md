# BusBee - Complete Project Features Analysis

## Project Overview
**BusBee** is a comprehensive bus ticket reservation system built with the MERN stack (MongoDB, Express.js, React.js, Node.js). It provides a complete booking ecosystem with three distinct user roles: regular users, bus operators, and administrators.

**Live Deployment**: https://bus-bee.vercel.app/

---

## 🎯 Core Features & Functionalities

### 1. **User Authentication & Authorization**

#### Registration & Login
- **Email/Password Registration**: Users can create accounts with name, email, password, and phone
- **Google OAuth Integration**: One-click sign-in with Google account
- **JWT Token Authentication**: Secure session management with JSON Web Tokens
- **Password Encryption**: Bcrypt hashing for secure password storage
- **Role-Based Access Control**: Three user roles (user, admin, operator) with different permissions

#### User Profile Management
- View and edit personal information (name, email, phone)
- Upload and update profile avatar
- View account creation date and verification status
- Manage contact details for bookings

---

### 2. **Bus Search & Discovery**

#### Smart Search System
- **Dynamic Route Loading**: Routes are fetched from database (not hardcoded)
- **Autocomplete Search**: Type-ahead suggestions for source and destination cities
- **Keyboard Navigation**: Arrow keys to navigate suggestions, Enter to select
- **Date Selection**: Calendar-based date picker with minimum date validation
- **Real-time Filtering**: Excludes selected "From" city from "To" options

#### Search Results
- Display all available buses for selected route and date
- Show bus details: operator name, bus type, departure/arrival times, duration
- Display available seats count
- Show pricing information
- Filter and sort options

---

### 3. **Seat Selection & Booking**

#### Visual Seat Layout
- **Interactive Seat Map**: Visual representation of bus layout
- **Dual Deck Support**: Lower and upper deck for sleeper buses
- **Seat Types**: 
  - Seater seats
  - Sleeper berths
- **Seat Status Indicators**:
  - Available (green) - can be selected
  - Selected (blue) - currently selected by user
  - Booked (gray) - already reserved
- **Real-time Availability**: Seats update instantly based on bookings
- **Gender-based Booking**: Optional gender restrictions for certain seats

#### Seat Configuration
- Customizable layout (rows, columns for left/right sections)
- Support for different bus configurations
- Seat numbering system (e.g., S1, S2, etc.)

---

### 4. **Passenger Information**

#### Passenger Details Collection
- Name (required)
- Age (required)
- Gender (Male/Female/Other)
- Automatic seat assignment to each passenger
- Support for multiple passengers in single booking

#### Contact Information
- Email for booking confirmation
- Phone number for SMS notifications
- Validation of contact details

---

### 5. **Boarding & Dropping Points**

#### Point Selection
- **Multiple Boarding Points**: Choose convenient pickup location
- **Multiple Dropping Points**: Select destination drop-off point
- **Time Information**: Display pickup/drop-off times for each point
- **Location Details**: Full address and landmark information

---

### 6. **Booking Management**

#### Booking Creation
- **Instant Confirmation**: Direct booking without payment gateway
- **Unique Booking ID**: Auto-generated booking reference (format: BK + timestamp + random)
- **Seat Reservation**: Automatic seat blocking upon confirmation
- **Email Notifications**: Confirmation email with booking details
- **SMS Notifications**: Text message with ticket information

#### My Bookings
- View all past and upcoming bookings
- Display booking status (confirmed, cancelled, completed)
- Show complete journey details
- Access booking confirmation and ticket
- Download/print ticket option

#### Booking Cancellation
- **Time-based Restrictions**: Cannot cancel within 4 hours of departure
- **Automatic Refund Calculation**: 90% refund (10% cancellation fee)
- **Seat Release**: Automatically frees up cancelled seats
- **Email Notification**: Cancellation confirmation with refund details
- **Status Update**: Changes booking status to "cancelled"

---

### 7. **Payment System**

#### Payment Processing
- Currently configured for direct booking (no payment gateway)
- Razorpay integration ready (credentials in rzp-key.csv)
- Payment page structure in place for future integration
- Total amount calculation based on seat count and bus price

---

### 8. **Email Notification System**

#### Automated Emails
- **Booking Confirmation**: 
  - Booking ID and reference number
  - Bus details (operator, bus number, type)
  - Journey details (route, date, time)
  - Passenger information
  - Seat numbers
  - Boarding/dropping points
  - Total amount paid
  
- **Cancellation Notification**:
  - Cancellation confirmation
  - Refund amount details
  - Refund processing timeline

#### Email Configuration
- Gmail SMTP integration
- Nodemailer service
- Professional email templates
- Error handling (booking succeeds even if email fails)

---

### 9. **Chat Assistant (AI Chatbot)**

#### Features
- **Fixed Position**: Bottom-right corner of all pages
- **Expandable Interface**: Click to open/close chat window
- **Auto-scroll**: Automatically scrolls to latest message
- **Keyword-based Responses**: Intelligent replies based on user queries

#### Supported Queries
- Greetings (Hi, Hello, Vanakkam in Tamil)
- Ticket cancellation process
- Refund policies and timelines
- Contact support information
- Rescheduling tickets
- Bus delay notifications
- Payment failure handling
- Boarding point information
- Discount and coupon codes
- Ticket download/viewing
- Luggage policies
- COVID safety protocols
- General booking assistance

#### UI Features
- Modern chat bubble design
- User messages (blue, right-aligned)
- Bot messages (white, left-aligned)
- Send button and Enter key support
- Smooth animations and transitions
- Responsive design

---

### 10. **Admin Dashboard**

#### Analytics & Statistics
- **Revenue Tracking**: Total revenue from all bookings
- **Booking Statistics**: Total bookings, confirmed, cancelled, completed
- **User Management**: Total registered users count
- **Bus Fleet Overview**: Total buses in system

#### Bus Management (CRUD)
- **View All Buses**: List of all buses with details
- **Add New Bus**: Create bus with complete configuration
- **Edit Bus**: Update bus details, schedule, pricing
- **Delete Bus**: Remove buses from system
- **Activate/Deactivate**: Toggle bus availability

#### Booking Management
- View all bookings across all operators
- Filter by status, date, operator
- View detailed booking information
- Access passenger details
- Monitor booking trends

#### User Management
- View all registered users
- See user details (name, email, phone, role)
- View user booking history
- Manage user roles (user, operator, admin)
- User verification status

#### Route Management
- View all available routes
- Add new routes
- Edit existing routes
- Monitor route popularity
- Distance and duration tracking

#### Operator Management
- View all bus operators
- Add new operators
- Manage operator credentials
- Assign buses to operators
- Monitor operator performance

---

### 11. **Operator Dashboard**

#### Operator-Specific Features
- **My Buses**: View only buses owned by logged-in operator
- **Add Bus**: Create new bus with comprehensive details
- **Edit My Buses**: Update own bus information
- **Delete My Buses**: Remove own buses

#### Bus Configuration Options
- **Basic Details**:
  - Bus number (unique identifier)
  - Operator name
  - Bus type (AC, Non-AC, Sleeper, Semi-Sleeper, Luxury)
  - Total seats capacity
  
- **Route Information**:
  - Source city
  - Destination city
  - Distance in kilometers
  
- **Schedule Details**:
  - Departure date and time
  - Arrival date and time
  - Journey duration
  - Travel hours
  
- **Pricing**:
  - Base price per seat
  - Separate pricing for seater/sleeper (optional)
  
- **Amenities**:
  - WiFi availability
  - Charging points
  - Water bottle
  - Blanket
  - Reading light
  - Emergency exit
  - GPS tracking
  - CCTV cameras
  
- **Boarding/Dropping Points**:
  - Multiple pickup locations with times
  - Multiple drop-off locations with times
  
- **Cancellation Policy**:
  - Allow/disallow cancellations
  - Charge type (percentage/fixed)
  - Charge amount
  - Refund policy description
  - Time limit for cancellation
  
- **Operator Contact**:
  - Contact number
  - Emergency contact
  - Support email
  
- **Additional Details**:
  - Rest stops information
  - Rest stop duration
  - Live tracking availability
  - Partial booking allowed
  
- **Safety Features**:
  - Fire extinguisher
  - First aid kit
  - Seat belts
  
- **Driver Details**:
  - Driver name
  - Phone number
  - License number
  
- **Visual Elements**:
  - Bus images (multiple)
  - Rating system
  - Reviews from passengers
  
- **Seat Layout Configuration**:
  - Number of rows
  - Columns on left side
  - Columns on right side
  - Upper deck availability

#### Booking Management
- **My Bookings**: View bookings for operator's buses only
- **Booking Details**: Access passenger information
- **Revenue Tracking**: Monitor earnings from bookings
- **Booking Statistics**: Analyze booking patterns

---

### 12. **User Interface Features**

#### Homepage
- **Hero Section**: Eye-catching gradient background with search form
- **Search Form**: Prominent bus search with autocomplete
- **Features Section**: Highlights key benefits (Safe & Secure, On-Time Service, Best Prices)
- **FAQ Section**: Expandable accordion with common questions
- **Chat Assistant**: Always accessible chatbot

#### Navigation
- **User Navbar**: 
  - Logo/Brand name
  - Profile dropdown
  - My Bookings link
  - Logout option
  - Login/Register buttons (when not logged in)
  
- **Admin Navbar**: 
  - Separate admin interface
  - Dashboard link
  - Quick access to admin functions
  
- **Operator Navbar**:
  - Operator-specific interface
  - Dashboard and bus management links

#### Footer
- Contact information
- Social media links
- Quick links (About, Terms, Privacy)
- Copyright information

#### Responsive Design
- Mobile-friendly layout
- Tablet optimization
- Desktop full-width experience
- Touch-friendly controls

---

### 13. **Data Models & Structure**

#### User Model
- Name, email, password (hashed)
- Google ID (for OAuth)
- Phone number
- Role (user/admin/operator)
- Verification status
- Avatar/profile picture
- Booking references
- Timestamps (created, updated)

#### Bus Model
- Bus number and operator details
- Bus type and capacity
- Seat configuration (array of seat objects)
- Route information (from, to, distance)
- Schedule (departure, arrival, duration)
- Pricing (base, seater, sleeper)
- Amenities (object with boolean flags)
- Boarding/dropping points (arrays)
- Cancellation policy
- Operator contact info
- Additional details
- Safety features
- Driver details
- Images array
- Active status
- Rating and reviews
- Layout configuration
- Timestamps

#### Booking Model
- Unique booking ID
- User reference
- Bus reference
- Passengers array (name, age, gender, seat)
- Journey date
- Booking date
- Total amount
- Status (confirmed/cancelled/completed)
- Contact details (email, phone)
- Boarding point (location, time)
- Dropping point (location, time)
- Timestamps

#### Seat Schema (within Bus)
- Seat number
- Type (seater/sleeper)
- Deck (lower/upper)
- Row and column position
- Booking status
- Gender restriction
- Booked by (user reference)
- Booking ID reference

---

### 14. **API Endpoints**

#### Authentication Routes (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /me` - Get current user profile
- `GET /google` - Initiate Google OAuth
- `GET /google/callback` - Google OAuth callback

#### Bus Routes (`/api/buses`)
- `GET /search` - Search buses by route and date
- `GET /routes/available` - Get all unique routes
- `GET /operator/my-buses` - Get operator's buses
- `GET /:id` - Get single bus details
- `POST /` - Create new bus (operator/admin)
- `PUT /:id` - Update bus (operator/admin)
- `DELETE /:id` - Delete bus (operator/admin)
- `GET /` - Get all buses (admin)

#### Booking Routes (`/api/bookings`)
- `POST /` - Create new booking
- `GET /my-bookings` - Get user's bookings
- `GET /operator/my-bookings` - Get operator's bookings
- `GET /:id` - Get booking by ID
- `PUT /:id/cancel` - Cancel booking

#### Admin Routes (`/api/admin`)
- `GET /dashboard` - Dashboard statistics
- `GET /bookings` - All bookings
- `GET /users` - All users

#### User Routes (`/api/user`)
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile

#### Payment Routes (`/api/payment`)
- `POST /create-order` - Create payment order
- `POST /verify` - Verify payment

#### Operator Routes (`/api/operator`)
- Operator-specific endpoints for bus and booking management

---

### 15. **Security Features**

#### Authentication & Authorization
- JWT token-based authentication
- HTTP-only cookies for token storage
- Token expiration and refresh
- Role-based access control (RBAC)
- Protected routes for authenticated users
- Admin-only routes
- Operator-only routes

#### Data Security
- Password hashing with bcrypt (10 rounds)
- Input validation and sanitization
- MongoDB injection prevention
- XSS protection
- CORS configuration
- Rate limiting on API endpoints
- Helmet.js for security headers

#### Privacy
- Secure password storage (never stored in plain text)
- Email verification system
- Secure session management
- User data access control

---

### 16. **Business Logic & Validations**

#### Booking Validations
- Seat availability check before booking
- Prevent double booking of same seat
- Journey date must be in future
- Minimum 4-hour cancellation window
- Contact details required
- Passenger details validation

#### Bus Validations
- Unique bus number per date
- Valid route (from ≠ to)
- Positive seat count
- Valid schedule (departure before arrival)
- Price must be positive
- Operator must exist

#### User Validations
- Unique email addresses
- Password minimum length (6 characters)
- Valid email format
- Phone number format
- Required fields enforcement

---

### 17. **Additional Features**

#### Search Optimization
- Dynamic route fetching from database
- Autocomplete with keyboard navigation
- Smart city filtering (excludes selected cities)
- Date validation (no past dates)
- URL parameter-based search results

#### Booking Workflow
1. Search buses
2. View bus details
3. Select seats
4. Choose boarding/dropping points
5. Enter passenger details
6. Review booking summary
7. Confirm booking
8. Receive confirmation

#### User Experience
- Loading states for async operations
- Error handling with user-friendly messages
- Toast notifications for actions
- Smooth page transitions
- Responsive feedback on interactions
- Confirmation dialogs for critical actions

#### Performance
- Lazy loading of components
- Optimized database queries
- Indexed database fields
- Efficient state management
- Minimal re-renders

---

## 🎨 Design & Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Gradient Backgrounds**: Modern blue gradients
- **Card-based Layouts**: Clean, organized content
- **Icons**: Lucide React icons throughout
- **Color Scheme**: Blue primary, gray neutrals
- **Typography**: Clear hierarchy, readable fonts
- **Spacing**: Consistent padding and margins
- **Shadows**: Subtle depth and elevation
- **Hover Effects**: Interactive feedback
- **Animations**: Smooth transitions

---

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

All features work seamlessly across all device sizes.

---

## 🔄 Real-time Features

- Seat availability updates
- Booking status changes
- Route availability
- User session management
- Instant booking confirmation

---

## 📊 Data Flow

1. **User Registration/Login** → JWT Token → Authenticated Session
2. **Search Buses** → API Call → Database Query → Results Display
3. **Select Seats** → Real-time Availability Check → Selection Confirmation
4. **Create Booking** → Validation → Seat Reservation → Email Notification → Confirmation
5. **Cancel Booking** → Validation → Seat Release → Refund Calculation → Email Notification

---

## 🚀 Deployment

- **Frontend**: Vercel (React app)
- **Backend**: Vercel (Node.js API)
- **Database**: MongoDB Atlas (Cloud)
- **Email**: Gmail SMTP
- **Environment Variables**: Secure configuration

---

## 📝 Summary

BusBee is a full-featured bus reservation platform with:
- ✅ 3 user roles (User, Operator, Admin)
- ✅ Complete booking lifecycle (search → book → manage → cancel)
- ✅ Real-time seat selection with visual layout
- ✅ Email notifications for all actions
- ✅ AI chatbot for customer support
- ✅ Comprehensive admin and operator dashboards
- ✅ Secure authentication and authorization
- ✅ Responsive design for all devices
- ✅ Production-ready deployment

The system handles the entire bus ticket booking ecosystem from route discovery to booking confirmation and management.
