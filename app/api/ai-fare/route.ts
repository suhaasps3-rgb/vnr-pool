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

    // Attempt to lookup approximate distance from our dictionary
    const distKey = origin.toLowerCase() === "vnr vjiet campus gate 1" || origin.toLowerCase().includes("vnr") ? destination.toLowerCase() : origin.toLowerCase();
    const distanceKm = DISTANCE_MAP[distKey] || 15; // default to 15 if unknown

    // Mathematically pre-calculate the base fare so the AI doesn't hallucinate exponential curves
    let baseRate = vehicle_type === 'car' ? 19 : vehicle_type === 'auto' ? 14 : 9;
    let baseFare = Math.round(distanceKm * baseRate);
    
    // Hardcode outlier exceptions provided by user (typically long-distance ORR/toll routes)
    if (distKey.includes('attapur')) baseFare = vehicle_type === 'car' ? 1026 : 300;
    if (distKey.includes('rasoolpura')) baseFare = vehicle_type === 'car' ? 450 : 180;
    if (distKey.includes('bowenpally')) baseFare = vehicle_type === 'car' ? 347 : 138;
    if (distKey.includes('cbit')) baseFare = vehicle_type === 'car' ? 685 : 274;
    if (distKey.includes('dammaiguda')) baseFare = vehicle_type === 'car' ? 755 : 302;
    if (distKey.includes('dilsukhnagar') && vehicle_type === 'bike') baseFare = 330;

    const systemPrompt = `You are a highly intelligent transport pricing AI acting as a neutral third-party for a college carpool app in Hyderabad, India. 
Your goal is to suggest a perfectly fair total trip fare that drivers and students will instantly agree on.
We have pre-calculated the mathematically strict base fare for this trip based on the exact distance and vehicle type.
The base calculated fare is ₹${baseFare}.
You must suggest a final fare that is exactly equal to (or within 5% of) this base fare, adjusting only slightly for realistic traffic conditions if needed.
Respond ONLY with a valid JSON object containing exactly two keys:
"reasoning": A short, 1-2 sentence explanation of why this fare is fair. YOU MUST INCLUDE THE EXACT FINAL PRICE IN THIS SENTENCE (e.g. "Based on a distance of 10km and moderate traffic, a fair total fare is ₹250.").
"suggested_total_fare": A number representing the total trip cost in Indian Rupees (₹) to be split among passengers.`;



    const userPrompt = `Calculate a fair fare for this ride:
Origin: ${origin}
Destination: ${destination}
Approximate Distance: ${distanceKm} km
Base Fare Calculated: ₹${baseFare}
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
