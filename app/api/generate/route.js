// File: app/api/generate/route.js

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini client with the API key from environment variables
// Ensure GEMINI_API_KEY is set in your .env.local file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    // Get the clientName and task from the request body
    const { clientName, task } = await request.json();

    if (!clientName || !task) {
      return new Response(JSON.stringify({ error: 'Missing clientName or task' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    
    // The new, tailored prompt for Josh W.'s "Smart Nudge"
    const prompt = `
      Act as Josh W., a marketing expert and CEO who helps businesses grow with proven strategies. Your tone is supportive, insightful, and focused on tangible results.

      A client named '${clientName}' has just completed a key task in their 7-Day Roadmap: '${task}'.

      Generate a concise, encouraging 'Smart Nudge' that does two things:
      1. Acknowledges their specific progress on the task they just completed.
      2. Gently and logically suggests the value of an 'Implementation Audit Session' to ensure they are getting the most out of the strategy and to refine their execution.

      The message should feel personal and directly related to their completed task. It should not be a hard sell. The output must be a single, conversational message ready to be sent to the client.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Send the generated text back to the frontend
    return new Response(JSON.stringify({ message: text }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate nudge' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
    });
  }
}
