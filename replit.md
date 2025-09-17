# Overview

This is a full-stack banking web application built with modern web technologies. The application provides a complete digital banking experience with user authentication, account management, payments, transaction history, and administrative features. It includes support for internationalization, voice commands, and Stripe integration for payment processing.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is built using React with TypeScript and follows a modern component-based architecture:

- **UI Framework**: React with TypeScript for type safety
- **Styling**: TailwindCSS with shadcn/ui component library for consistent design
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Internationalization**: react-i18next for multi-language support (English, Kannada, Hindi)
- **Build Tool**: Vite for fast development and optimized production builds

The frontend architecture separates concerns into:
- Pages for route components
- Reusable UI components from shadcn/ui
- Custom hooks for business logic
- Utility libraries for common functions

## Backend Architecture

The backend uses a Node.js/Express server with a file-based storage system:

- **Server**: Express.js with TypeScript
- **Session Management**: express-session for user authentication
- **Data Storage**: File-based JSON storage system (designed to be easily replaceable)
- **Schema Validation**: Zod for runtime type checking and validation
- **Password Security**: bcryptjs for password hashing
- **Database Migration Ready**: Drizzle ORM configured for PostgreSQL (not currently used)

The backend follows RESTful API principles with clear separation between:
- Route handlers for HTTP endpoints
- Storage abstraction layer for data operations
- Authentication middleware for protected routes
- Session-based user management

## Data Storage Architecture

Currently uses a file-based storage system with JSON files:

- **Users Data**: Stored in `data/users.json`
- **Transactions Data**: Stored in `data/transactions.json`
- **Storage Interface**: Abstract storage interface allows easy migration to database
- **Future Migration**: Drizzle ORM already configured for PostgreSQL transition

The storage layer provides:
- User management (create, authenticate, update)
- Transaction recording and retrieval
- Balance management
- Admin user capabilities

## Authentication & Authorization

Session-based authentication system:

- **Session Storage**: Server-side sessions with secure cookies
- **Password Security**: bcrypt hashing with salt rounds
- **Role-based Access**: Admin vs regular user permissions
- **Route Protection**: Middleware-based authentication checks
- **Session Configuration**: Secure cookies in production, HTTP-only flags

## Feature Architecture

### Payment System
- Stripe integration for payment processing
- Internal balance management
- Transaction recording and status tracking
- Support for various transaction types (sent, received, withdrawal, deposit)

### Voice Assistant
- Browser Speech Recognition API integration
- Command pattern for voice commands
- Natural language processing for banking commands
- Navigation and action triggers via voice

### Internationalization
- Multi-language support (English, Kannada, Hindi)
- Centralized translation management
- Language switching with persistent preferences
- Localized UI components

### Admin Panel
- User management capabilities
- Transaction monitoring
- System statistics and reporting
- User activation/deactivation controls

# External Dependencies

## Core Technologies
- **React**: Frontend framework for building user interfaces
- **Express**: Web server framework for Node.js
- **TypeScript**: Type safety across the entire application
- **Vite**: Build tool and development server

## UI and Styling
- **TailwindCSS**: Utility-first CSS framework
- **Radix UI**: Headless UI components for accessibility
- **shadcn/ui**: Pre-built component library based on Radix UI
- **Lucide React**: Icon library for consistent iconography

## Data Management
- **TanStack Query**: Server state management and caching
- **Drizzle ORM**: Database ORM (configured for future PostgreSQL use)
- **Zod**: Schema validation and type inference

## Authentication & Security
- **bcryptjs**: Password hashing and verification
- **express-session**: Session management middleware
- **connect-pg-simple**: PostgreSQL session store (for future use)

## Payment Processing
- **Stripe**: Payment processing and handling
- **@stripe/stripe-js**: Stripe JavaScript SDK
- **@stripe/react-stripe-js**: React components for Stripe

## Internationalization
- **i18next**: Internationalization framework
- **react-i18next**: React bindings for i18next

## Development Tools
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Development utilities
- **@replit/vite-plugin-dev-banner**: Development environment indicators

## Database (Configured but not active)
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver
- **drizzle-kit**: Database migration and management tools