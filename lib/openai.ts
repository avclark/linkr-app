import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function extractMentionsFromTranscript(transcript: string): Promise<string[]> {
  const prompt = `
You're an assistant that extracts names of people mentioned in podcast transcripts.

Your job is to return a **plain JSON array of strings** like this:
["Name One", "Name Two", "Name Three"]

Only include **people's names** (first + last preferred), mentioned in the transcript.
Don't return links, timestamps, or any other formatting.

Here's the transcript:
${transcript}
`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
  });

  const raw = completion.choices[0]?.message.content ?? '[]';

  try {
    return JSON.parse(raw);
  } catch {
    console.warn('AI response was not valid JSON. Raw output:', raw);
    return [];
  }
}