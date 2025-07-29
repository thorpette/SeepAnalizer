# PageSpeed Analyzer - replit.md

## Overview

This is a full-stack web application that provides comprehensive website performance analysis similar to Google PageSpeed Insights with enhanced backend analysis capabilities. The application analyzes websites for performance metrics, accessibility, best practices, and SEO scores, while also providing detailed backend server analysis including Ruby/Rails detection, security headers, cache optimization, and database performance metrics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for client-side routing with multi-page navigation
- **State Management**: TanStack Query (React Query) for server state
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds
- **Pages**: Main analysis page and dedicated Ruby agent testing interface

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API structure
- **Development**: Hot reload with Vite integration in development mode

### Data Storage
- **Database**: PostgreSQL with Neon serverless (production ready)
- **ORM**: Drizzle ORM with TypeScript schema definitions
- **Implementation**: DatabaseStorage class with PostgreSQL persistence
- **Session Storage**: PostgreSQL with connect-pg-simple
- **Fallback**: MemStorage class for development/testing scenarios

## Key Components

### Frontend Components
- **UrlAnalysisForm**: Main input form for website analysis requests with device selection
- **PerformanceResults**: Displays comprehensive analysis results with 4-score layout
- **CircularChart**: Custom canvas-based circular progress charts for scores
- **MetricsGrid**: Core Web Vitals metrics visualization (FCP, LCP, TBT, CLS)
- **BackendAnalysis**: Comprehensive backend server analysis display
- **ResourceDetails**: Page size, request count, and load time metrics
- **Recommendations**: Multilingual actionable improvement suggestions
- **TimelineChart**: Performance timeline visualization with interactive canvas
- **LoadingState**: Enhanced multi-step analysis progress indicator
- **ErrorState**: Error handling and retry functionality
- **RubyAgentStatus**: Interactive testing interface for Ruby agent functionality
- **Navigation**: Multi-page navigation between main analysis and Ruby agent tools

### Backend Services
- **Analysis Engine**: Enhanced performance analysis with real backend detection
- **Backend Analyzer**: Real-time server technology detection (Ruby/Rails, Nginx, Apache)
- **Security Scanner**: HTTP headers analysis (HTTPS, HSTS, CSP, X-Frame-Options)
- **Cache Analyzer**: Cache headers evaluation (Cache-Control, ETag, Last-Modified)
- **Database Monitor**: Ruby/Rails database performance simulation
- **Ruby Performance Agent**: Standalone Ruby script for authentic backend analysis
- **Storage Layer**: Abstracted storage interface with in-memory implementation
- **API Routes**: RESTful endpoints for comprehensive analysis operations

### Database Schema
- **Analyses Table**: Core performance analysis data with comprehensive metrics
  - Performance scores (Performance, Accessibility, Best Practices, SEO)
  - Core Web Vitals metrics (FCP, LCP, TBT, CLS, Speed Index)
  - Resource details (page size, request count, load time)
  - Backend analysis (server technology, response times, compression)
  - Security headers analysis (HTTPS, HSTS, CSP, X-Frame-Options)
  - Cache optimization headers (Cache-Control, ETag, Last-Modified)
  - Ruby agent integration (raw Ruby output storage)
  - Database performance metrics (query time, connection pools, slow queries)
  - Recommendations and timeline data (JSON columns)
  - Analysis lifecycle tracking (pending → processing → completed/failed)

- **User Sessions Table**: Optional analytics tracking
  - Session identification and user agent tracking
  - IP address logging for analytics

- **Analysis History Table**: Links analyses to user sessions
  - Relationship tracking between sessions and analyses

### Shared Schema
- **Legacy Compatibility**: Maintains existing Zod schemas for frontend compatibility
- **Type Safety**: Full TypeScript integration with Drizzle schema inference
- **Data Conversion**: Automatic conversion between database and legacy formats

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

## Ruby Performance Agent

### Overview
The system includes a standalone Ruby performance agent (`ruby_agent/performance_agent.rb`) that provides authentic backend analysis for websites, especially optimized for Ruby on Rails applications.

### Agent Capabilities
- **Connectivity Analysis**: Multiple response time measurements, redirect detection, HTTP status analysis
- **Headers Analysis**: Server detection, compression analysis, cache headers, security headers
- **SSL/TLS Security**: Certificate validation, expiration dates, issuer information, security assessment
- **Ruby/Rails Detection**: Automatic Rails detection, X-Runtime analysis, server detection (Puma, Unicorn, Passenger)
- **Database Metrics**: Estimated database performance, query analysis, connection pool monitoring
- **Resource Analysis**: Page size analysis, asset counting, request estimation

### Integration
- **Automatic Integration**: The Ruby agent integrates seamlessly with the main Node.js backend
- **Fallback System**: If Ruby is unavailable, the system falls back to Node.js-based analysis
- **Real Data**: Performs actual HTTP requests and SSL analysis for accurate metrics
- **JSON Output**: Structured report generation compatible with the main system schema

### Usage
- **Command Line**: `ruby performance_agent.rb https://example.com`
- **API Integration**: Automatic execution via `/api/ruby-agent` endpoint
- **Web Interface**: Dedicated testing page at `/ruby-agent` route

The application is designed as a monorepo with clear separation between client, server, shared code, and the Ruby agent, making it maintainable and scalable for future enhancements like real Lighthouse integration.