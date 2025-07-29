# PageSpeed Analyzer - replit.md

## Overview

This is a full-stack web application that provides website performance analysis similar to Google PageSpeed Insights. The application analyzes websites for performance metrics, accessibility, best practices, and SEO scores, providing detailed recommendations for improvement.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API structure
- **Development**: Hot reload with Vite integration in development mode

### Data Storage
- **Database**: PostgreSQL (configured via Drizzle)
- **ORM**: Drizzle ORM with Zod schema validation
- **Current Implementation**: In-memory storage (MemStorage class) for development
- **Session Storage**: PostgreSQL with connect-pg-simple

## Key Components

### Frontend Components
- **UrlAnalysisForm**: Main input form for website analysis requests
- **PerformanceResults**: Displays comprehensive analysis results
- **CircularChart**: Custom canvas-based circular progress charts
- **MetricsGrid**: Performance metrics visualization
- **Recommendations**: Actionable improvement suggestions
- **TimelineChart**: Performance timeline visualization
- **LoadingState**: Analysis progress indicator
- **ErrorState**: Error handling and retry functionality

### Backend Services
- **Analysis Engine**: Mock performance analysis (simulates Lighthouse/Puppeteer)
- **Storage Layer**: Abstracted storage interface with in-memory implementation
- **API Routes**: RESTful endpoints for analysis operations

### Shared Schema
- **Performance Analysis Schema**: Comprehensive data structure including:
  - Core web vitals (FCP, LCP, TBT, CLS, Speed Index)
  - Accessibility, Best Practices, and SEO scores
  - Resource details (page size, request count, load time)
  - Improvement recommendations
  - Timeline data for visualization

## Data Flow

1. **Analysis Request**: User submits URL and device type via form
2. **API Processing**: Backend creates analysis record and starts processing
3. **Polling Mechanism**: Frontend polls for analysis completion
4. **Mock Analysis**: Backend simulates performance testing with realistic data
5. **Results Display**: Comprehensive results rendered with interactive visualizations
6. **Recommendations**: Actionable suggestions provided based on performance scores

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives with shadcn/ui styling
- **Data Fetching**: TanStack Query for API state management
- **Icons**: Lucide React for consistent iconography
- **Date Handling**: date-fns for date formatting
- **Validation**: Zod for runtime type checking

### Backend Dependencies
- **Database**: Neon serverless PostgreSQL
- **ORM**: Drizzle with PostgreSQL dialect
- **Session Management**: connect-pg-simple for PostgreSQL sessions
- **Development**: tsx for TypeScript execution, esbuild for production builds

### Development Tools
- **Build System**: Vite with React plugin
- **Code Quality**: TypeScript with strict configuration
- **Styling**: PostCSS with Tailwind CSS and Autoprefixer
- **Replit Integration**: Custom plugins for development environment

## Deployment Strategy

### Development Mode
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx with nodemon-like behavior
- **Database**: Uses DATABASE_URL environment variable
- **Integration**: Vite middleware serves frontend through Express

### Production Build
- **Frontend**: Static build output to `dist/public`
- **Backend**: ESM bundle via esbuild to `dist/index.js`
- **Database**: Drizzle migrations applied via `db:push` command
- **Serving**: Express serves static frontend files

### Environment Configuration
- **Database**: PostgreSQL connection via DATABASE_URL
- **Session**: PostgreSQL-backed sessions for scalability
- **Build**: Separate client/server TypeScript configurations
- **Paths**: Configured aliases for clean imports (@/, @shared/)

The application is designed as a monorepo with clear separation between client, server, and shared code, making it maintainable and scalable for future enhancements like real Lighthouse integration.