import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: "https://api.x.ai/v1",
  apiKey: "xai-S7I8XppKfvDbktadkCq5ShsXjXz2OmqH9cfbNx3OVUeZplqAvLMHTccTy0kI26iRfGpRS7NHJzFt9HUW"
});

async function testXAI() {
  try {
    console.log("Testing xAI Grok integration...");
    
    const response = await client.chat.completions.create({
      model: "grok-3-latest",
      messages: [
        {
          role: "system",
          content: "You are a test assistant."
        },
        {
          role: "user",
          content: "Testing. Just say hi and hello world and nothing else."
        }
      ],
      stream: false,
      temperature: 0
    });
    
    console.log("✅ xAI Integration Test Successful!");
    console.log("Response:", response.choices[0].message.content);
    
  } catch (error) {
    console.error("❌ xAI Integration Test Failed:", error.message);
  }
}

testXAI();