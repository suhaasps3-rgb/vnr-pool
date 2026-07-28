import { NextResponse } from 'next/server';

// Smart keyword-based AI responses for VNR Pool
// No external API needed — instant, free, unlimited

interface QA {
  keywords: string[];
  response: string;
}

const knowledgeBase: QA[] = [
  {
    keywords: ['book', 'ride', 'seat', 'reserve', 'find ride', 'how to book'],
    response: "To book a ride, tap the **Find Ride** tab 🔍 You'll see all available rides. Pick one that matches your route and timing, then hit **Book Seat**. The driver will get notified instantly! Make sure to arrive at the pickup point on time 🚗"
  },
  {
    keywords: ['offer', 'drive', 'give ride', 'post ride', 'driver', 'offer seat'],
    response: "Want to offer a ride? Go to the **Offer Seat** tab 🚙 Fill in your route (origin & destination), set the date/time, pick your vehicle type, and set available seats. Students looking for rides on your route will be able to book instantly!"
  },
  {
    keywords: ['fare', 'split', 'cost', 'price', 'money', 'pay', 'payment', 'upi', 'charge', 'fee'],
    response: "The fare is split **fairly** among all passengers based on distance 💰 For example, if a car ride costs ₹200 and there are 4 riders, each pays ₹50. Payments are made **directly to the driver via UPI** — VNR Pool doesn't handle any money. Check the fare calculator on the dashboard for estimates!"
  },
  {
    keywords: ['safe', 'security', 'trust', 'verify', 'id', 'danger', 'risk'],
    response: "Your safety is our top priority! 🛡️ Here are some tips:\n• Always **verify the driver's college ID** before boarding\n• Share your **live location** with a friend via WhatsApp\n• Only ride with verified **@vnrvjiet.in** students\n• Rate your driver after every ride — low-rated users get flagged\n• Report any issues to the college transport committee"
  },
  {
    keywords: ['cancel', 'remove', 'delete', 'undo', 'cancel ride', 'cancel booking'],
    response: "To cancel a booking, go to **My Rides** tab, find your upcoming ride, and tap **Cancel**. Please cancel early so the driver can find another rider! Frequent cancellations may affect your rating 📋"
  },
  {
    keywords: ['rate', 'rating', 'review', 'feedback', 'star'],
    response: "After each ride, you can rate your driver/rider with 1-5 stars ⭐ Good ratings build trust in the community. Drivers with consistently low ratings may be flagged. Be honest but fair with your ratings!"
  },
  {
    keywords: ['sign up', 'register', 'join', 'account', 'create account', 'new'],
    response: "To join VNR Pool:\n1️⃣ Enter your **@vnrvjiet.in** college email\n2️⃣ Set a password and verify your email\n3️⃣ Complete your profile (name, roll no, branch, mobile)\n4️⃣ Verify your mobile number with OTP\n5️⃣ You're in! Start finding or offering rides 🎉"
  },
  {
    keywords: ['route', 'area', 'location', 'kompally', 'miyapur', 'kphb', 'bachupally', 'kukatpally', 'where'],
    response: "VNR Pool covers rides between **VNR VJIET college** and popular neighborhoods like Kompally, Miyapur, Bachupally, KPHB, Kukatpally, Nizampet, Pragathi Nagar, and more! 🗺️ Just enter your origin and destination when booking or offering a ride."
  },
  {
    keywords: ['vehicle', 'car', 'bike', 'auto', 'type'],
    response: "We support 3 vehicle types:\n🚗 **Car** — Most comfortable, fits 3-4 passengers\n🛺 **Auto** — Budget-friendly, fits 2-3 passengers\n🏍️ **Bike** — Fastest, 1 passenger only\nChoose based on your comfort and budget!"
  },
  {
    keywords: ['profile', 'edit', 'update', 'change', 'name', 'number', 'branch'],
    response: "To update your profile, go to the **Profile** tab in the bottom navigation. You can edit your name, branch, and contact details. Your roll number and email are locked after verification 🔒"
  },
  {
    keywords: ['block', 'report', 'complaint', 'problem', 'issue', 'harass'],
    response: "If you face any issues:\n🚫 **Block** the user from the ride card or their profile\n📢 **Report** serious issues to the college transport committee\n⚠️ Blocked users can't see your rides or book with you\nYour safety matters most! Don't hesitate to report any problems."
  },
  {
    keywords: ['notification', 'alert', 'remind', 'bell'],
    response: "Tap the 🔔 bell icon in the top navigation to see all your notifications — booking confirmations, ride updates, and reminders. Enable browser notifications for real-time alerts!"
  },
  {
    keywords: ['hello', 'hi', 'hey', 'howdy', 'yo', 'sup', 'good morning', 'good evening'],
    response: "Hey there! 👋 I'm Veer, your VNR Pool assistant. I can help you with booking rides, understanding fare splits, safety tips, and navigating the app. What would you like to know? 😊"
  },
  {
    keywords: ['thanks', 'thank you', 'thx', 'appreciate'],
    response: "You're welcome! 😊 Happy to help. If you have any more questions about VNR Pool, just ask. Have a great ride! 🚗✨"
  },
  {
    keywords: ['who are you', 'what are you', 'your name', 'veer'],
    response: "I'm **Veer** 🤖 — your AI-powered assistant for VNR Pool! I'm here to help you navigate the app, understand how rides work, and answer any questions about the platform. Think of me as your friendly VNRPool guide! 🎓"
  },
];

function findBestResponse(message: string): string {
  const msg = message.toLowerCase().trim();
  
  let bestMatch = { score: 0, response: '' };
  
  for (const qa of knowledgeBase) {
    let score = 0;
    for (const keyword of qa.keywords) {
      if (msg.includes(keyword.toLowerCase())) {
        // Longer keyword matches are worth more
        score += keyword.length;
      }
    }
    if (score > bestMatch.score) {
      bestMatch = { score, response: qa.response };
    }
  }
  
  if (bestMatch.score > 0) {
    return bestMatch.response;
  }
  
  // Default response for unrecognized questions
  return "Hmm, I'm not sure about that one 🤔 I can help you with:\n• **Booking or offering rides**\n• **Fare splits and payments**\n• **Safety tips**\n• **Account & profile help**\n• **Vehicle types and routes**\n\nTry asking about any of these! 😊";
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1]?.content || '';
    const reply = findBestResponse(lastMessage);

    // Small delay to feel natural
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error('Chat API error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
