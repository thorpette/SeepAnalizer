-- Initialization script for PostgreSQL database
-- This will be executed when the container starts for the first time

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- The tables will be created automatically by Drizzle when the app starts
-- This file ensures the database is properly initialized