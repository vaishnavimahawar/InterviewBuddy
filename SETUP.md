# Setup Guide - Resolving 503 Service Unavailable Error

## Quick Fix for 503 Error

The 503 Service Unavailable error you're encountering is likely due to one of these issues:

### 1. Missing or Invalid API Key

**Problem**: The application can't authenticate with Google's AI service.

**Solution**: 
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Create a `.env` file in your project root
4. Add your API key:

```env
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

### 2. Model Unavailability

**Problem**: The `gemini-2.0-flash-exp` model might be temporarily unavailable.

**Solution**: The application now automatically falls back to `gemini-1.5-flash` if the primary model fails.

### 3. Rate Limiting

**Problem**: You've exceeded the API rate limits.

**Solution**: Wait a few minutes before trying again. The application now includes retry logic with exponential backoff.

## Step-by-Step Setup

### Step 1: Get Your API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

### Step 2: Configure Environment Variables

1. In your project root, create a file named `.env`
2. Add your API key:

```env
VITE_GEMINI_API_KEY=your_api_key_here
```

**Important**: Replace `your_api_key_here` with your actual API key.

### Step 3: Restart the Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm run dev
```

### Step 4: Test the Application

1. Navigate to the form page
2. Fill out the interview details
3. Click "Generate Questions"
4. The application should now work without the 503 error

## Troubleshooting

### Still Getting 503 Error?

1. **Check your API key**: Make sure it's valid and active
2. **Check your internet connection**: Ensure you can access Google's services
3. **Try again later**: The service might be temporarily unavailable
4. **Check the console**: Look for more specific error messages

### Other Common Errors

- **"API key not configured"**: Your `.env` file is missing or the key isn't set
- **"Invalid API key"**: Your API key is incorrect or expired
- **"Rate limit exceeded"**: Wait a few minutes before trying again

## Environment File Structure

Your `.env` file should look like this:

```env
# Google Generative AI API Key
VITE_GEMINI_API_KEY=AIzaSyC...your_actual_key_here

# Optional: Firebase configuration (if you're using Firebase)
# VITE_FIREBASE_API_KEY=your_firebase_key
# VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
# VITE_FIREBASE_PROJECT_ID=your_project_id
```

## Need Help?

If you're still experiencing issues:

1. Check the browser console for detailed error messages
2. Verify your API key is active in Google AI Studio
3. Try generating questions with different parameters
4. Check if the Google AI service status is operational

The application now includes improved error handling and will provide more specific feedback about what's going wrong.

## Recent Improvements

### Timeout Handling
- **60-second timeout**: The app now waits up to 60 seconds for AI responses
- **Multiple primary attempts**: Tries the primary model twice before falling back
- **Automatic retries**: If the first attempt fails, it automatically retries with delays
- **Fallback models**: If the primary model is overloaded, it tries a fallback model
- **Better user feedback**: Users are informed that generation may take time

### Error Recovery
- **Exponential backoff**: Retries with increasing delays (2s, 4s, 8s)
- **Specific error messages**: Clear feedback for different types of errors
- **Timeout detection**: Handles cases where the AI model is taking too long to respond 