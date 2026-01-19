import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
});

// Fallback model in case the primary model is unavailable
const fallbackModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

export const chatSession = model.startChat({
  generationConfig,
  safetySettings,
});

export const fallbackChatSession = fallbackModel.startChat({
  generationConfig,
  safetySettings,
});

// Helper function to try primary model first, then fallback with retry mechanism and proper timeout
export const getChatSession = async (prompt: string, maxRetries = 3) => {
  let lastError: any;
  let primaryModelAttempts = 0;
  const maxPrimaryAttempts = 2; // Try primary model twice before fallback
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Try primary model for first 2 attempts, then fallback
      if (primaryModelAttempts < maxPrimaryAttempts) {
        primaryModelAttempts++;
        console.log(`Attempt ${attempt + 1}: Sending request to primary model (attempt ${primaryModelAttempts}/${maxPrimaryAttempts})...`);
        const result = await Promise.race([
          chatSession.sendMessage(prompt),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Request timeout - model taking too long to respond")), 60000) // 60 second timeout
          )
        ]);
        console.log("Primary model response received successfully");
        return result;
      } else {
        // Try fallback model on subsequent attempts with longer timeout
        console.log(`Attempt ${attempt + 1}: Trying fallback model...`);
        const result = await Promise.race([
          fallbackChatSession.sendMessage(prompt),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Request timeout - fallback model taking too long to respond")), 60000) // 60 second timeout
          )
        ]);
        console.log("Fallback model response received successfully");
        return result;
      }
    } catch (error: any) {
      lastError = error;
      console.error(`Attempt ${attempt + 1} failed:`, error.message);
      
      // For 503 errors, always retry regardless of attempt number
      if (error?.status === 503) {
        if (attempt < maxRetries) {
          // Wait before retrying (increased exponential backoff)
          const waitTime = Math.pow(2, attempt + 1) * 2000; // 2s, 4s, 8s
          console.log(`Model overloaded (503). Waiting ${waitTime/1000} seconds before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }
      
      // For timeout or 500 errors, we can retry
      if (error?.status === 500 || error?.message?.includes("timeout")) {
        if (attempt < maxRetries) {
          // Wait longer before retrying (increased exponential backoff)
          const waitTime = Math.pow(2, attempt + 1) * 2000; // 2s, 4s, 8s
          console.log(`Waiting ${waitTime/1000} seconds before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }
      
      // For other errors or max retries reached, throw the error
      throw error;
    }
  }
  
  throw lastError;
};
