# Bus Reservation System - MERN Stack (Without Payment Integration)

A complete bus ticket reservation system built with MongoDB, Express.js, React.js, and Node.js. Features include user authentication, bus search, seat selection, booking management, email notifications, and admin panel.

## Features

### User Features
- User registration and login
- Bus search with filters
- Seat selection with visual layout
- Direct booking confirmation (no payment required)
- Email notifications
- Booking history and management
- Profile management

### Admin Features
- Admin dashboard with analytics
- Bus management (CRUD operations)
- Booking management
- User management
- Revenue tracking
- Route management

## Tech Stack

**Backend:**
- Node.js
- Express.js
- MongoDB Atlas
- JWT Authentication
- Nodemailer (Email service)

**Frontend:**
- React.js
- React Router
- Tailwind CSS
- Axios
- React Query
- React Hot Toast

## Installation

1. **Clone the repository**
\`\`\`bash
git clone <repository-url>
cd bus-reservation-app
\`\`\`

2. **Install Backend Dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Install Frontend Dependencies**
\`\`\`bash
cd frontend
npm install
cd ..
\`\`\`

4. **Environment Variables**
Create a `.env` file in the root directory with:
\`\`\`env
MONGODB_URI=mongodb+srv://busadmin:U0yl48Vu6Ajrm0vz@busreservationcluster.arsla6o.mongodb.net/
JWT_SECRET=K8f2Nx9mP4qR7sT1vW3yZ5bC8eH6jL9n
PORT=5000

# Email Configuration
EMAIL_USER=deepann0911@gmail.com
EMAIL_PASS=@#09112004
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# Frontend URL
CLIENT_URL=http://localhost:3000
\`\`\`

5. **Seed Sample Data**
\`\`\`bash
npm run seed
\`\`\`

6. **Start the Application**

Backend:
\`\`\`bash
npm run dev
\`\`\`

Frontend (in another terminal):
\`\`\`bash
cd frontend
npm start
\`\`\`

## Email Setup

The application uses Gmail SMTP for sending emails. To set up:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification
   - App passwords → Generate password
   - Use this password in `EMAIL_PASS`

## Default Login Credentials

After running the seed script:

**Admin:**
- Email: admin@example.com
- Password: password123

**User:**
- Email: user@example.com
- Password: password123

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Buses
- `GET /api/buses/search` - Search buses
- `GET /api/buses/:id` - Get bus details
- `POST /api/buses` - Create bus (Admin)
- `PUT /api/buses/:id` - Update bus (Admin)
- `DELETE /api/buses/:id` - Delete bus (Admin)

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - Get user bookings
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/bookings` - All bookings
- `GET /api/admin/users` - All users

## Features in Detail

### Seat Selection
- Visual bus layout with seat arrangement
- Real-time seat availability
- Interactive seat selection
- Different seat types (window, aisle, etc.)

### Direct Booking
- Instant booking confirmation without payment
- Automatic seat reservation
- Email confirmation
- Booking management

### Email Notifications
- Booking confirmation emails
- Cancellation notifications
- Professional email templates
- Automated email sending

### Admin Dashboard
- Revenue analytics
- Booking statistics
- User management
- Bus fleet management

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Rate limiting
- Helmet for security headers

## Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Different screen sizes

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@busbooking.com or create an issue in the repository.
