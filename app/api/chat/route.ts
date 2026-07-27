import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent`;

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

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    // Build conversation history for Gemini
    const contents = [
      {
        role: 'user',
        parts: [{ text: SYSTEM_PROMPT }],
      },
      {
        role: 'model',
        parts: [{ text: "Hey! I'm Veer, your VNR Pool assistant 🚗 How can I help you today?" }],
      },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
    ];

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY!,
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 300,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Gemini error:', err);
      // Return the actual error so the client can show it for debugging
      return NextResponse.json({ error: `Gemini API error: ${err}` }, { status: 500 });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Sorry, I couldn't process that. Try again!";

    return NextResponse.json({ reply: text });
  } catch (err: any) {
    console.error('Chat API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
