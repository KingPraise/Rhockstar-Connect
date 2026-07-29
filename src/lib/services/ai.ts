export type AIPersona = 'career' | 'dating';

export interface AIMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const mockResponses: Record<AIPersona, string[]> = {
  career: [
    "That's a great question! When updating your resume, always quantify your impact. Instead of saying 'improved performance', say 'improved performance by 25%'.",
    "For your upcoming interview, remember the STAR method: Situation, Task, Action, Result. It helps structure your answers effectively.",
    "Salary negotiation is tough but necessary! A good strategy is to ask for 10-15% above your current compensation or the market average for your role.",
    "Networking on Rhockstar Connect is key. Try reaching out to 3 people in your industry this week with a simple 'I admire your work' message.",
    "I see you're looking for roles. Make sure your 'Top Skills' section matches the keywords in the job descriptions you're applying for!"
  ],
  dating: [
    "Your first photo should be a clear, smiling headshot. Save the group photos for later so they know who they're looking at!",
    "When sending an intro, mention something specific from their profile. It shows you paid attention and makes you stand out.",
    "A great date idea? Keep it low-pressure. A quick coffee or a walk in the park allows for easy conversation without the commitment of a full dinner.",
    "Don't overthink the opening message! A simple 'Hey, I love your taste in music! What's your favorite concert you've been to?' works wonders.",
    "Remember to update your Dating Goals! Being upfront about what you're looking for saves everyone time."
  ]
};

export const getAIResponse = async (persona: AIPersona, message: string): Promise<string> => {
  // Simulate network/AI processing delay (1.5s to 3s)
  const delay = Math.floor(Math.random() * 1500) + 1500;
  await new Promise(resolve => setTimeout(resolve, delay));

  // Pick a random response from the mocked list
  const responses = mockResponses[persona];
  const response = responses[Math.floor(Math.random() * responses.length)];
  
  return response;
};
