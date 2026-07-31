const apiKey = "rc_7c2451b1ce5a74cb3b87d044ad37e627a913127e927e159748313e33254fdd90";

const systemPrompt = `You are a highly intelligent transport pricing AI acting as a neutral third-party for a college carpool app in Hyderabad, India. 
Your goal is to suggest a perfectly fair total trip fare that drivers and students will instantly agree on.
Consider factors like typical auto/cab rates in Hyderabad, distance between locations, and typical traffic.
Respond ONLY with a valid JSON object containing exactly two keys:
"reasoning": A short, 1-2 sentence explanation of why this fare is fair (e.g. mentioning surge, traffic, or distance).
"suggested_total_fare": A number representing the total trip cost in Indian Rupees (₹) to be split among passengers.`;

const userPrompt = `Calculate a fair fare for this ride:
Origin: JNTU Metro
Destination: VNR VJIET
Vehicle Type: car
Number of Passengers: 4`;

const model = "Qwen/Qwen2.5-7B-Instruct";

async function test() {
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

  const text = await response.text();
  console.log("Status:", response.status);
  console.log("Response:", text);
}

test();
