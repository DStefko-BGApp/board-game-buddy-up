# GameNight - Project Knowledge Base (T=0)

## Project Overview
GameNight is a comprehensive gaming community platform that helps board game enthusiasts manage their collections, organize game nights, connect with friends, and access helpful gaming tools. The app serves as a central hub for the board gaming community.

## Technology Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** with custom design system for styling
- **Shadcn/UI** component library for consistent UI elements
- **React Router** for client-side routing
- **React Query** for data fetching and caching
- **React Hook Form** with Zod validation
- **Lucide React** for iconography

### Backend & Infrastructure
- **Supabase** for backend-as-a-service
- **PostgreSQL** database with Row Level Security (RLS)
- **Supabase Auth** for user authentication
- **Supabase Storage** for file uploads (avatars)
- **Supabase Edge Functions** for serverless logic
- **Resend** for email delivery

### Mobile
- **Capacitor** for mobile app deployment (iOS/Android)

## Core Features

### 1. Authentication System
- Email/password authentication via Supabase Auth
- Automatic profile creation on signup
- Protected routes requiring authentication
- Session management with automatic token refresh

### 2. User Profiles & Settings
- **Profile Management**: Display name, bio, avatar upload
- **Gaming Preferences**: Favorite games, mechanics, gaming style
- **BGG Integration**: Link BoardGameGeek username
- **Privacy Controls**: Public/private library settings
- **Contact Information**: Discord handle, location, availability

### 3. Game Library Management
- **Manual Game Addition**: Search and add games via custom interface
- **BGG Collection Sync**: Import entire BoardGameGeek collections
- **Personal Ratings & Notes**: Rate games 1-10, add personal notes
- **Ownership Tracking**: Mark games as owned vs wishlist
- **Expansion Management**: Link expansions to base games
- **Advanced Filtering**: Filter by player count, playtime, mechanics, ratings
- **Statistics Dashboard**: Collection overview and analytics

### 4. Friends & Social Features
- **Friend Requests**: Send/receive/accept friend requests
- **Friend Discovery**: Search users by display name or BGG username
- **Profile Viewing**: View friends' public profiles and game libraries
- **Activity Feed**: See friends' gaming activities (future expansion ready)

### 5. Game Night Planning
- **Event Creation**: Schedule game nights with date, time, location
- **Game Selection**: Choose games from personal library
- **Friend Invitations**: Invite friends to game nights
- **RSVP System**: Track attendance and responses
- **Event Management**: Edit, cancel, or update game nights

### 6. Gaming Tools & Randomizers
- **Dice Roller**: Support for D4, D6, D8, D10, D12, D20 with visual icons
- **Coin Flip**: Animated coin flipping with heads/tails cycling
- **Random Choice Generator**: Pick random options from custom lists
- **Player Order Shuffler**: Randomize turn order for games

### 7. BoardGameGeek Integration
- **API Integration**: Real-time game data fetching
- **Collection Import**: Bulk import user collections
- **Game Search**: Search BGG database for games
- **Metadata Sync**: Game descriptions, images, player counts, etc.
- **Expansion Detection**: Automatic identification of game expansions

### 8. Contact & Support System
- **Contact Forms**: Structured support request forms
- **Feature Suggestions**: Dedicated feature request system
- **Email Integration**: Direct email delivery via Resend
- **Form Validation**: Complete validation with error handling

## Database Schema

### Core Tables

#### `profiles`
- User profile information and preferences
- Links to auth.users via user_id
- Public visibility controls
- Gaming preferences and social info

#### `games`
- Master game database with BGG integration
- Game metadata (players, time, complexity, ratings)
- Category and mechanic tagging
- Expansion relationships

#### `user_games`
- User's personal game collection
- Ownership status (owned/wishlist)
- Personal ratings and notes
- Date tracking for collection management

#### `friendships`
- Friend relationship management
- Request/accepted status tracking
- Bidirectional friend connections

#### `game_nights`
- Game night event planning
- Date, time, location, and game selection
- Attendee tracking and RSVP system

#### `activities`
- User activity tracking for social features
- Extensible metadata for different activity types

### Security Implementation
- **Row Level Security (RLS)** on all tables
- **User-specific policies** ensuring data isolation
- **Friend-based access** for social features
- **Public data policies** for discoverable content

## API Integrations

### BoardGameGeek API
- **Game Search**: Search BGG database by name
- **Collection Import**: Fetch user's complete collection
- **Game Details**: Retrieve comprehensive game information
- **Expansion Data**: Fetch expansion relationships

### Resend Email Service
- **Contact Forms**: Send structured support emails
- **Feature Requests**: Send organized feature suggestions
- **Email Templates**: HTML-formatted emails with user context

## UI/UX Design System

### Design Tokens
- **Color Palette**: Gaming-themed gradients and accent colors
- **Typography**: Clear hierarchy with gradient text effects
- **Spacing**: Consistent spacing using Tailwind scale
- **Animations**: Smooth transitions and hover effects

### Component Architecture
- **Reusable Components**: Consistent UI elements across pages
- **Shadcn Integration**: Customized component library
- **Responsive Design**: Mobile-first approach with breakpoints
- **Accessibility**: ARIA labels and keyboard navigation

### Visual Patterns
- **Gaming Aesthetic**: Dark theme with colorful accents
- **Card-based Layout**: Consistent card components for content
- **Gradient Effects**: Eye-catching gradients for branding
- **Interactive Elements**: Hover animations and state feedback

## Key Workflows

### New User Onboarding
1. User signs up with email/password
2. Profile automatically created in database
3. User guided to complete profile setup
4. Optional BGG collection import
5. Friend discovery and connection

### Game Library Management
1. Search BGG or add games manually
2. Games saved to personal collection
3. Rate, review, and categorize games
4. Filter and organize collection
5. Share library with friends (if public)

### Friend Connection Process
1. Search for users by name/BGG username
2. Send friend request
3. Recipient accepts/declines request
4. Access to friend's public profile and library
5. Invite friends to game nights

### Game Night Planning
1. Create new game night event
2. Set date, time, and location
3. Select games from personal library
4. Invite friends from friend list
5. Track RSVPs and manage attendance

## Mobile Considerations
- **Capacitor Integration**: Ready for iOS/Android deployment
- **Responsive Design**: Optimized for mobile screens
- **Touch Interactions**: Mobile-friendly button sizes and gestures
- **Offline Capability**: Future enhancement ready

## Security Features
- **Authentication Required**: All core features require login
- **Data Isolation**: Users can only access their own data
- **Friend-based Sharing**: Controlled access to friend data
- **Input Validation**: Complete form validation and sanitization
- **API Security**: Secure edge function implementation

## Performance Optimizations
- **React Query Caching**: Efficient data fetching and caching
- **Image Optimization**: Optimized avatar and game images
- **Lazy Loading**: Components loaded as needed
- **Database Indexing**: Optimized queries with proper indexes

## Future Enhancement Areas
- **Real-time Messaging**: Chat system for game coordination
- **Gaming Groups**: Create and manage gaming clubs
- **Event Calendar**: Advanced calendar integration
- **Game Recommendations**: AI-powered game suggestions
- **Achievement System**: Gamification features
- **Advanced Analytics**: Detailed gaming statistics
- **Social Feed**: Activity streams and social interactions

## Development Patterns
- **Component Composition**: Reusable, composable components
- **Custom Hooks**: Shared logic extraction
- **Type Safety**: Comprehensive TypeScript usage
- **Error Handling**: Consistent error states and user feedback
- **Loading States**: Proper loading indicators throughout

This knowledge base represents the complete feature set and technical implementation as of the current state (T=0) of the GameNight project.