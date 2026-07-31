import { NextResponse } from 'next/server';
import { DISTANCE_MAP } from '@/lib/locations';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { origin, destination, vehicle_type, passengers } = body;

    if (!origin || !destination || !vehicle_type || !passengers) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const apiKey = process.env.FEATHERLESS_API_KEY || "rc_7c2451b1ce5a74cb3b87d044ad37e627a913127e927e159748313e33254fdd90";

    const systemPrompt = `You are a highly intelligent transport pricing AI acting as a neutral third-party for a college carpool app in Hyderabad, India. 
Your goal is to suggest a perfectly fair total trip fare that drivers and students will instantly agree on.
Consider factors like typical auto/cab rates in Hyderabad, the exact distance provided, and typical traffic.
To calibrate your pricing, use these exact reference rates for a Car (Student Vehicle Pool) to VNR VJIET:
- Attapur (28km) = ₹1026
- Rasoolpura = ₹450
- Yusufguda Temple (19km) = ₹362
- Suchitra (15km) = ₹287
- Bowenpally (16km) = ₹347
- BITS Pilani Hyderabad = ₹605
Extrapolate logically for other distances and vehicle types (autos should be cheaper than cars, bikes even cheaper).
Respond ONLY with a valid JSON object containing exactly two keys:
"reasoning": A short, 1-2 sentence explanation of why this fare is fair. YOU MUST INCLUDE THE EXACT FINAL PRICE IN THIS SENTENCE (e.g. "Based on a distance of 10km, a fair total fare is ₹250.").
"suggested_total_fare": A number representing the total trip cost in Indian Rupees (₹) to be split among passengers.`;

    // Attempt to lookup approximate distance from our dictionary
    const distKey = origin.toLowerCase() === "vnr vjiet campus gate 1" || origin.toLowerCase().includes("vnr") ? destination.toLowerCase() : origin.toLowerCase();
    const distanceKm = DISTANCE_MAP[distKey] || "unknown";

    const userPrompt = `Calculate a fair fare for this ride:
Origin: ${origin}
Destination: ${destination}
Approximate Distance: ${distanceKm} km
Vehicle Type: ${vehicle_type}
Number of Passengers: ${passengers}`;

    // Using a lightweight, fast open-source model available on Featherless (ungated)
    const model = "Qwen/Qwen2.5-7B-Instruct";

    const response = await fetch('https://api.featherless.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Featherless API Error:", errText);
      throw new Error(`Featherless API returned ${response.status}`);
    }

    const data = await response.json();
    const aiContent = data.choices[0].message.content;
    
    let parsedResult;
    try {
      parsedResult = JSON.parse(aiContent);
    } catch (parseError) {
      console.error("Failed to parse AI JSON:", aiContent);
      throw new Error("AI returned invalid JSON");
    }

    const finalFare = typeof parsedResult.suggested_total_fare === 'number' ? parsedResult.suggested_total_fare : parseInt(parsedResult.suggested_total_fare) || 200;
    const finalReasoning = parsedResult.reasoning ? `${parsedResult.reasoning} (Suggested Total: ₹${finalFare})` : `AI suggested based on distance and traffic. (Suggested Total: ₹${finalFare})`;

    return NextResponse.json({
      reasoning: finalReasoning,
      suggested_total_fare: finalFare
    });

  } catch (error: any) {
    console.error('AI Fare API error:', error);
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}
