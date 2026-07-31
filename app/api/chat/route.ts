import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const apiKey = process.env.FEATHERLESS_API_KEY || "rc_7c2451b1ce5a74cb3b87d044ad37e627a913127e927e159748313e33254fdd90";

    const systemPrompt = `You are Veer, the friendly and helpful AI assistant for the VNR Pool app (an exclusive ride-sharing platform for VNR VJIET students).
Your KNOWLEDGE IS STRICTLY LIMITED to the VNR Pool website, carpooling, booking rides, offering rides, cancelling rides, deleting rides, fare splitting, and app safety.
If the user asks a question about ANYTHING else (e.g., general knowledge, coding, math, or unrelated chit-chat), you MUST reply EXACTLY with this generic message:
"I am just a simple bot and my knowledge is limited to the VNR Pool website. Please ask me questions related to how to book or offer a ride, how fare splitting works, safety tips, or how to cancel a ride."

Never invent policies. Stick strictly to these facts:
- Rides are strictly for @vnrvjiet.in verified students.
- Fares are split fairly using our dynamic AI fare splitter based on distance and vehicle type (Car, Auto, Bike).
- Payments are made directly to the driver via UPI outside the app. VNR Pool does not handle money.
- Users can block/report suspicious behavior to ensure safety.
- Booking and offering rides happens through the "Find Ride" and "Offer Ride" tabs on the dashboard.
- Users verify their accounts using an 8-digit OTP sent to their college email.
- To cancel or delete a ride, go to the "Bookings" or "My Rides" tab and click Delete/Cancel.`;

    // Format messages for Featherless (OpenAI compatible)
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      }))
    ];

    // Using Qwen 7B for fast and reliable chat responses (verified working on Featherless)
    const model = "Qwen/Qwen2.5-7B-Instruct";

    const response = await fetch('https://api.featherless.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 150
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Featherless Chat API Error:", errText);
      throw new Error(`Featherless API returned ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error('Chat API error:', err);
    return NextResponse.json({ error: 'Something went wrong connecting to Veer.' }, { status: 500 });
  }
}
