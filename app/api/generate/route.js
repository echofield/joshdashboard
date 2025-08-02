// File: app/api/generate/route.js

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini client with the API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    // Get the clientName and task from the request body
    const { clientName, task } = await request.json();

    if (!clientName || !task) {
      return new Response(JSON.stringify({ error: 'Missing clientName or task' }), { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    
    // The prompt for the AI
    const prompt = `Act as a marketing consultant's AI assistant. A client named '${clientName}' has just completed a task: '${task}'. Generate a 'gentle upgrade prompt' to encourage them to buy a premium content creation package. The prompt should be friendly, professional, and focus on helping them achieve their goals faster. The output should be a single, conversational message.`;

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
    return new Response(JSON.stringify({ error: 'Failed to generate prompt' }), { status: 500 });
  }
}