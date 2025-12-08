import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY is not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = streamText({
      model: google('gemini-2.0-flash-exp'),
      messages,
      system: `You are Forge AI, a helpful assistant for Anajak Tools (อนาจักร ทูลส์) - an AI-powered productivity platform.

Your role:
- Help users with their tasks and questions
- Provide guidance on using the 80+ tools available
- Answer questions in Thai or English based on user preference
- Be friendly, concise, and helpful
- Suggest relevant tools when appropriate

Available tool categories:
- PDF Tools (merge, split, compress, convert)
- Image Tools (resize, compress, background removal)
- Finance Tools (tax calculator, invoice generator)
- QR & Barcode tools
- Developer Tools (JSON formatter, Base64, Hash)
- Text Tools (translator, summarizer)
- And many more...

Always be respectful and provide accurate information. If you're unsure, say so.`,
      temperature: 0.7,
      maxTokens: 2048,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('AI Chat Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process AI request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}



