# AI Development Rules for A.R HRMS

## Tech Stack Overview

• **Frontend**: React 18 with TypeScript, Vite build system
• **UI Framework**: Tailwind CSS with shadcn/ui components and Radix UI primitives
• **State Management**: React Context API with localStorage persistence
• **Routing**: React Router v6 for client-side navigation
• **Backend**: FastAPI Python server with MongoDB (via Motor async driver)
• **Database**: MongoDB for document-based data storage
• **Authentication**: JWT-based token authentication with role-based access control
• **Maps**: Mapbox GL JS for location services and geocoding
• **UI Components**: Lucide React icons, Recharts for data visualization
• **Build Tools**: Vite for frontend bundling, Yarn for dependency management

## Library Usage Rules

### Core UI Components
- **shadcn/ui** is the primary component library - use these components whenever possible
- **Radix UI** primitives are used as the foundation for shadcn components - do not use directly
- **Tailwind CSS** is the exclusive styling solution - no CSS-in-JS or other styling libraries
- **Lucide React** is the only icon library - do not引入 other icon libraries

### State Management
- **React Context API** for global state (Auth, Theme)
- **localStorage** for client-side data persistence
- **useState/useReducer** for local component state
- Do not引入 external state management libraries like Redux or Zustand

### Data Fetching
- **Axios** for HTTP requests to backend API
- **fetch API** as a lightweight alternative for simple requests
- Do not use other HTTP clients like ky or got

### Routing
- **React Router DOM** exclusively for all routing needs
- Use programmatic navigation with useNavigate hook
- Do not引入 alternative routing libraries

### Forms
- **React Hook Form** for all form handling and validation
- **Zod** for schema validation when needed
- Do not use Formik or other form libraries

### Charts and Data Visualization
- **Recharts** for all data visualization needs
- Use appropriate chart types (bar, line, pie) based on data representation
- Do not引入 other charting libraries like Chart.js or D3

### Maps and Location
- **Mapbox GL JS** exclusively for all map functionality
- Use Mapbox geocoding API for address lookups
- Do not引入 Google Maps or other mapping libraries

### Notifications and Toasts
- **Sonner** for toast notifications
- **shadcn Toast** component for application toasts
- Do not use react-toastify or other toast libraries

### Date Handling
- **date-fns** for all date manipulation and formatting
- Use built-in date formatting for simple cases
- Do not引入 moment.js or other date libraries

### Authentication
- Use built-in JWT handling with localStorage
- Do not引入 third-party auth libraries like Auth0 or Firebase Auth

### Backend (Python)
- **FastAPI** for REST API endpoints
- **Motor** for async MongoDB operations
- **Pydantic** for data validation and serialization
- Do not引入 Django or Flask for web framework

### Database
- **MongoDB** with Motor driver for async operations
- Use Pydantic models for data validation
- Do not引入 SQL databases or ORMs like SQLAlchemy

### Testing
- **Jest** for unit testing (frontend)
- **Pytest** for backend testing
- Use built-in testing utilities when possible
- Do not引入 Cypress or Selenium for E2E testing

### Build and Development
- **Vite** as the build tool and development server
- **Yarn** for package management
- **ESLint** and **Prettier** for code quality
- Do not引入 Webpack or other build tools directly

## Component Architecture Rules

1. **File Structure**: Components in `src/components`, Pages in `src/pages`, Context in `src/contexts`
2. **Component Design**: Prefer small, single-responsibility components
3. **Props**: Use TypeScript interfaces for all component props
4. **Hooks**: Custom hooks should be in `src/hooks` directory
5. **Utilities**: Helper functions in `src/lib` directory
6. **Types**: All type definitions in `src/types` directory

## Styling Guidelines

1. **Tailwind Only**: No CSS modules, styled-components, or other styling solutions
2. **Responsive Design**: Use Tailwind's responsive prefixes (sm:, md:, lg:, etc.)
3. **Dark Mode**: Use Tailwind's dark: prefix with CSS variables
4. **Consistent Spacing**: Use consistent padding/margin scales (p-4, p-6, p-8, etc.)
5. **Color Palette**: Stick to the defined color palette in Tailwind config

## API Integration Rules

1. **API Layer**: All API calls should go through `src/lib/api.js`
2. **Error Handling**: Centralized error handling in API layer
3. **Loading States**: Implement loading states for all async operations
4. **Data Validation**: Validate API responses with Zod schemas when appropriate
5. **Caching**: Use localStorage for client-side caching where appropriate

## Security Rules

1. **JWT Storage**: Store tokens in localStorage with secure handling
2. **Input Validation**: Validate all user inputs on both client and server
3. **CORS**: Configure CORS properly on backend
4. **Environment Variables**: Use .env files for configuration
5. **Password Handling**: Never log or expose passwords