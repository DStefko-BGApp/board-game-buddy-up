# BGG Integration Edge Function

## Overview
This function integrates with the BoardGameGeek (BGG) XML API2 to provide game search, details retrieval, and collection synchronization.

## Recent Optimizations

### 1. Enhanced Error Handling
- Added proper HTTP status code checking
- Improved BGG-specific error message detection
- Rate limit detection and user-friendly error messages
- Retry logic with exponential backoff

### 2. Better API Requests
- Added User-Agent headers for better BGG compatibility
- Enhanced URL parameters for more comprehensive data
- Exclusion of expansions in collection sync to focus on base games
- Optimized batch processing (reduced from 5 to 3 concurrent requests)

### 3. Rate Limiting Compliance
- Added delays between API calls (200-500ms random)
- Longer delays between batches (1000ms)
- Retry logic for failed requests
- Exponential backoff on errors

### 4. Data Quality Improvements
- Better HTML entity decoding
- Enhanced XML parsing with error checking
- Improved expansion relationship detection
- Added versions parameter for better game data

## BGG API Documentation Reference
Based on the official BGG XML API2 documentation, this function implements:
- Proper search with exact matching options
- Thing endpoint with stats and versions
- Collection endpoint with ownership filtering
- Error handling for queued collections and invalid users

## Usage
The function supports three main operations:
1. **Search**: `POST` with `searchTerm` parameter
2. **Game Details**: `POST` with `bggId` and `userId` parameters  
3. **Collection Sync**: `POST` to `/sync-collection` with `bggUsername` and `userId`

## Error Handling
The function now provides detailed error messages for:
- Rate limit exceeded
- Invalid usernames
- Queued collection processing
- Network errors
- Missing game data

## Performance Considerations
- Reduced concurrent requests to respect BGG's servers
- Added appropriate delays to prevent rate limiting
- Implemented retry logic for transient failures
- Optimized batch sizes for better reliability