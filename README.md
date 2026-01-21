# Interview Buddy

A full-stack interview preparation app built with React, Vite, Tailwind CSS, and Firebase Firestore.

**Live Demo**: https://interview-buddy-usfc.vercel.app 🚀

## Features
- Mock interview questions fetched from Firebase.
- Responsive design.
- Categories and real-time data.

## Tech Stack
- Frontend: React + Vite + Tailwind
- Database: Firebase Firestore

To run locally: `npm install` → `npm run dev`# AI Mock Interview Generator

A React + TypeScript application that generates personalized mock interview questions using Google's Generative AI. Perfect for job seekers preparing for technical and behavioral interviews.

## Features

- 🤖 AI-powered interview question generation
- 🎯 Customizable interview types (Technical, Behavioral, Mixed)
- 💾 Save and manage your interview sessions
- 🎨 Modern UI with Tailwind CSS and shadcn/ui
- 🔐 User authentication with Clerk
- ☁️ Firebase integration for data persistence

## Prerequisites

- Node.js (v16 or higher)
- npm, yarn, or pnpm
- Google Generative AI API key

## Setup Instructions

### 1. Clone the repository
```bash
git clone <repository-url>
cd AI_Pod
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory and add your API key:

```env
# Google Generative AI API Key
# Get your API key from: https://makersuite.google.com/app/apikey
VITE_GEMINI_API_KEY=your_api_key_here
```

**Important**: You need a valid Google Generative AI API key to use this application. Get one from the [Google AI Studio](https://makersuite.google.com/app/apikey).

### 4. Start the development server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The application will be available at `http://localhost:5173`

## Troubleshooting

### 503 Service Unavailable Error

If you encounter a 503 error when generating questions, it could be due to:

1. **Invalid API Key**: Make sure your `VITE_GEMINI_API_KEY` is correct and active
2. **Model Unavailability**: The AI model might be temporarily unavailable
3. **Rate Limiting**: You might have exceeded the API rate limits

The application now includes:
- ✅ Better error handling with specific error messages
- ✅ Automatic fallback to alternative models
- ✅ Retry mechanisms for temporary failures
- ✅ Clear feedback for configuration issues

### Common Issues

- **"API key not configured"**: Check your `.env` file and ensure `VITE_GEMINI_API_KEY` is set
- **"Service Unavailable"**: The AI service is temporarily down, try again in a few minutes
- **"Rate limit exceeded"**: Wait a moment before trying again
- **"Invalid API key"**: Verify your API key is correct and active

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **AI**: Google Generative AI (Gemini)
- **Authentication**: Clerk
- **Database**: Firebase Firestore
- **State Management**: React Hook Form + Zod validation

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
