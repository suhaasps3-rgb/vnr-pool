import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { origin, destination, vehicle_type, passengers } = body;

    if (!origin || !destination || !vehicle_type || !passengers) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const apiKey = process.env.FEATHERLESS_API_KEY;

    // Fallback if API key is not set (so the UI doesn't crash during testing)
    if (!apiKey) {
      console.warn("FEATHERLESS_API_KEY is not set. Returning mock AI response.");
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockFare = vehicle_type === 'car' ? 250 : vehicle_type === 'auto' ? 150 : 80;
      
      return NextResponse.json({
        reasoning: "AI Mock Response: Based on current traffic conditions from " + origin + " to " + destination + ", there is a slight surge. The suggested fair price for a " + vehicle_type + " is ₹" + mockFare + ".",
        suggested_total_fare: mockFare
      });
    }

    const systemPrompt = `You are a highly intelligent transport pricing AI acting as a neutral third-party for a college carpool app in Hyderabad, India. 
Your goal is to suggest a perfectly fair total trip fare that drivers and students will instantly agree on.
Consider factors like typical auto/cab rates in Hyderabad, distance between locations, and typical traffic.
Respond ONLY with a valid JSON object containing exactly two keys:
"reasoning": A short, 1-2 sentence explanation of why this fare is fair (e.g. mentioning surge, traffic, or distance).
"suggested_total_fare": A number representing the total trip cost in Indian Rupees (₹) to be split among passengers.`;

    const userPrompt = `Calculate a fair fare for this ride:
Origin: ${origin}
Destination: ${destination}
Vehicle Type: ${vehicle_type}
Number of Passengers: ${passengers}`;

    // Using a lightweight, fast open-source model available on Featherless
    const model = "meta-llama/Meta-Llama-3-8B-Instruct";

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

    return NextResponse.json({
      reasoning: parsedResult.reasoning || "AI suggested based on distance and traffic.",
      suggested_total_fare: typeof parsedResult.suggested_total_fare === 'number' ? parsedResult.suggested_total_fare : parseInt(parsedResult.suggested_total_fare) || 200
    });

  } catch (error: any) {
    console.error('AI Fare API error:', error);
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}
