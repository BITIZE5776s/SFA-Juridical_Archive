# Judicial Archive Management System

A comprehensive web-based judicial archive management system designed to streamline document management, case tracking, and administrative operations for legal institutions.

## 👨‍💻 Developer

**MIRINIOUI ZAKARIA**  
_Sole Designer, Developer & Architect_

This project was conceived, designed, and developed entirely from scratch by MIRINIOUI ZAKARIA. All aspects of the system including architecture, frontend, backend, database design, and user interface were created independently.

---

## 🚀 Main Technologies

### Frontend

- **React 18.3.1** - Modern UI library for building interactive user interfaces
- **TypeScript 5.6.3** - Type-safe JavaScript for enhanced code quality
- **Vite 5.4.19** - Fast build tool and development server
- **Wouter 3.3.5** - Lightweight routing solution
- **TanStack Query (React Query) 5.60.5** - Powerful data synchronization and state management
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Framer Motion 11.13.1** - Animation library
- **React Hook Form 7.55.0** - Performant form library
- **Zod 3.24.2** - TypeScript-first schema validation

### Backend

- **Express 4.21.2** - Fast, unopinionated web framework for Node.js
- **Node.js** - JavaScript runtime environment
- **TypeScript** - Type-safe backend development
- **Passport.js 0.7.0** - Authentication middleware
- **Express Session 1.18.1** - Session management
- **Multer 2.0.2** - File upload handling

### Database & Storage

- **PostgreSQL** - Robust relational database
- **Supabase** - Backend-as-a-Service for authentication and storage
- **Drizzle ORM 0.39.1** - TypeScript ORM for SQL databases
- **Neon Database** - Serverless PostgreSQL

### Additional Libraries

- **jsPDF 3.0.3** - PDF generation
- **html2canvas 1.4.1** - HTML to canvas conversion
- **JSZip 3.10.1** - ZIP file creation
- **Recharts 2.15.2** - Charting library
- **date-fns 3.6.0** - Date utility library
- **Lucide React** - Icon library

---

## 🔧 Secondary Technologies

- **ESBuild** - Fast JavaScript bundler
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing
- **Cross-env** - Cross-platform environment variable handling
- **WebSocket (ws)** - Real-time communication support
- **Memorystore** - Session storage
- **Connect-pg-simple** - PostgreSQL session store

---

## ✨ Main Functionalities

### 📄 Document Management

- **Document Creation & Upload**: Create new documents with metadata and upload files (PDF, Word, images, etc.)
- **Document Organization**: Organize documents by blocks, rows, and sections
- **Document Editor**: Rich text editing with attachment support
- **Document Search**: Full-text search across all documents
- **Document Filtering**: Filter by category, status, and other criteria
- **Document Status Tracking**: Track documents as pending, approved, or archived
- **Favorites System**: Mark and manage favorite documents
- **Recent Documents**: Quick access to recently viewed documents
- **Document Categories**: Categorize documents for better organization

### 👥 User Management

- **User Authentication**: Secure login system with Supabase Auth
- **Role-Based Access Control**: Different permission levels (Admin, User, etc.)
- **User Profiles**: Comprehensive user profile management
- **User Activity Logging**: Track all user actions and activities
- **User Restrictions**: Ability to restrict users with reasons
- **User Statistics**: View user activity statistics and account information
- **Password Management**: Change password functionality
- **Account Management**: Self-deletion and account management options

### 📊 Dashboard & Analytics

- **Statistics Overview**: Real-time statistics for documents, cases, and system health
- **Activity Feed**: Recent user activities and system events
- **Charts & Visualizations**: Data visualization with Recharts
- **System Reports**: Generate and view system reports
- **User Activity Dashboard**: Monitor user engagement and activity

### 💡 Recommendations System

- **Create Recommendations**: Submit recommendations for documents
- **Priority Levels**: Set low, medium, or high priority
- **Status Tracking**: Track recommendation status (pending, approved, rejected, implemented)
- **Recommendation Details**: View detailed information about each recommendation

### 💬 Comments & Collaboration

- **Document Comments**: Add comments to documents
- **Comment Types**: General, review, suggestion, and question types
- **Comment Resolution**: Mark comments as resolved
- **Comment Threading**: Organize and view comment discussions

### 🚨 Reports & Issues

- **Problem Reporting**: Report issues with documents or system
- **Report Types**: Error, improvement, complaint, and suggestion reports
- **Severity Levels**: Categorize reports by severity (low, medium, high, critical)
- **Status Management**: Track report status (open, in-progress, resolved, closed)

### ⚙️ Settings & Configuration

- **User Settings**: Personalize user preferences
- **Theme Management**: Light/dark mode support
- **Notification Settings**: Configure notification preferences
- **System Settings**: Administrative system configuration (admin only)

### 📁 File Management

- **File Upload**: Upload multiple file types (PDF, Word, images, text files)
- **File Storage**: Secure file storage with Supabase Storage
- **File Download**: Download documents and attachments
- **ZIP Export**: Export multiple documents as ZIP files
- **PDF Generation**: Generate PDF reports and documents

### 🔐 Security Features

- **Authentication**: Secure user authentication
- **Session Management**: Secure session handling
- **Access Control**: Role-based permissions
- **User Restrictions**: Ability to restrict user access
- **Activity Logging**: Comprehensive audit trail
- **Input Validation**: Zod schema validation for all inputs

---

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database (or Supabase account)

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd JudicialArchive
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:

   ```env
   PORT=5000
   NODE_ENV=development
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   DATABASE_URL=your_postgresql_connection_string
   ```

4. **Set up the database**

   ```bash
   npm run db:push
   ```

5. **Set up Supabase Storage**

   ```bash
   npm run setup-storage
   ```

6. **Start the development server**

   ```bash
   npm run dev
   ```

7. **Build for production**
   ```bash
   npm run build
   npm start
   ```

---

## 📁 Project Structure

```
JudicialArchive/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   └── main.tsx       # Entry point
│   └── index.html
├── server/                 # Backend Express server
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   ├── supabase.ts       # Supabase configuration
│   └── upload.ts         # File upload handling
├── shared/                 # Shared types and schemas
│   └── schema.ts          # TypeScript types and Zod schemas
├── dist/                   # Build output
└── package.json           # Dependencies and scripts
```

---

## 🚦 Available Scripts

- `npm run dev` - Start development server (port 5000)
- `npm run dev:alt` - Start development server (port 3001)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - Type check with TypeScript
- `npm run db:push` - Push database schema changes
- `npm run setup-storage` - Set up Supabase storage buckets

---

## 🌐 Features Overview

- ✅ **Multi-language Support**: Arabic interface with RTL support
- ✅ **Responsive Design**: Works on desktop, tablet, and mobile
- ✅ **Dark Mode**: Light and dark theme support
- ✅ **Real-time Updates**: Auto-refresh functionality
- ✅ **File Upload**: Support for multiple file types
- ✅ **Search & Filter**: Advanced search and filtering capabilities
- ✅ **Export Functionality**: PDF and ZIP export options
- ✅ **Activity Logging**: Comprehensive audit trail
- ✅ **User Management**: Complete user administration
- ✅ **Document Management**: Full CRUD operations for documents

---

## 📝 License

This project is proprietary software developed by MIRINIOUI ZAKARIA. All rights reserved.

---

## 📧 Contact

For questions, support, or inquiries about this project, please contact us at:
**zakmirinoui@gmail.com** 

---

- **Version:** 1.3.1 
- **Last Updated:** 2025
