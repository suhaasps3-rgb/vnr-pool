import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_PROMPT = `You are "Veer", the friendly AI assistant for VNR Pool — an exclusive ride-pooling app for VNR VJIET college students in Hyderabad, India.

Your personality: Friendly, helpful, concise. You speak casually like a fellow college student. Use emojis occasionally. Keep answers short (2-4 sentences max unless detailed steps are needed).

Key facts about VNR Pool:
- Only students and staff with @vnrvjiet.in email IDs can sign up
- Students can either OFFER a ride (as a driver) or FIND a ride (as a passenger)
- Rides go between home neighborhoods (Kompally, Miyapur, Bachupally, KPHB, etc.) and VNR VJIET college
- Vehicle types: Car, Auto, Bike
- Fare is split fairly between all passengers based on distance
- Payments are made directly to the driver via UPI — VNR Pool does NOT handle money
- To book a seat, go to "Find Ride" tab, browse available rides, and click "Book Seat"
- To offer a ride, go to "Offer Seat" tab and fill in your route details
- You can rate drivers/riders after each ride
- Safety tip: Always verify the driver's college ID before boarding
- For complaints or issues, contact the college transport committee

Things you can help with:
- How to book/cancel a ride
- How the fare split works
- How to offer a ride
- Account/profile questions
- Safety tips
- General app navigation

If someone asks something unrelated to VNR Pool or college transport, politely redirect them.
If you don't know something specific (like a user's actual ride status), tell them to check the app directly.

Never make up specific ride details, driver names, or times — you don't have access to live ride data.`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-8b' });

    // Build chat history (exclude the last user message)
    const history = [
      { role: 'user' as const, parts: [{ text: SYSTEM_PROMPT }] },
      { role: 'model' as const, parts: [{ text: "Hey! I'm Veer, your VNR Pool assistant 🚗 How can I help you today?" }] },
      ...messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
        role: (msg.role === 'assistant' ? 'model' : 'user') as 'model' | 'user',
        parts: [{ text: msg.content }],
      })),
    ];

    const lastMessage = messages[messages.length - 1].content;

    const chat = model.startChat({
      history,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 300,
      },
    });

    const result = await chat.sendMessage(lastMessage);
    const text = result.response.text();

    return NextResponse.json({ reply: text });
  } catch (err: any) {
    console.error('Chat API error:', err);
    return NextResponse.json({ error: `Error: ${err.message}` }, { status: 500 });
  }
}
