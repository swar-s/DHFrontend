# DesiHatti

DesiHatti is a full-stack property rental and booking platform designed to connect landlords and customers, enabling seamless property listings, bookings, payments, and reviews. The project consists of a Java Spring Boot backend and a React + Vite frontend, styled with Tailwind CSS.

## Features
- User authentication (Admin, Landlord, Customer)
- Property listing and management
- Booking system with payment integration
- User dashboards for different roles
- Review and rating system
- Real-time chat between users
- Responsive UI with modern design

---

## Project Structure
- **DesiHatti/** (Backend)
  - Java Spring Boot application
  - Handles API, business logic, database operations
  - Located in `src/main/java/com/desi/hatti`
  - Configuration in `src/main/resources/application.properties`
- **DHFrontend/** (Frontend)
  - React application using Vite
  - UI components, pages, and context
  - Located in `src/`
  - Static assets in `public/`

---

## How to Run the Project

### Prerequisites
- Node.js (v16+ recommended)
- Java (JDK 17+ recommended)
- Maven

### Backend (Spring Boot)
1. Backend is already hosted on railway.

### Frontend (React + Vite)
1. Open a terminal in the `DHFrontend` folder.
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
   The frontend will start on `http://localhost:5173` (default Vite port).

---

## How It Works
- Users register and log in as Admin, Landlord, or Customer.
- Landlords can list properties, manage bookings, and view reviews.
- Customers can browse properties, book them, make payments, and leave reviews.
- Admins manage users and oversee platform activity.
- Real-time chat enables communication between users.

---

## Next Steps / Future Improvements
- Add real payment gateways
- Enhance chat with notifications
- Improve property search and filtering
- Add analytics dashboard for landlords and admins

---

## Contributing
Feel free to fork the repo, open issues, or submit pull requests!
