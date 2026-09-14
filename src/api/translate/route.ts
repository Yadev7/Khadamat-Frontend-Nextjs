import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { name, descr, sourceLang } = await req.json();

    if (!name?.trim() && !descr?.trim()) {
      return NextResponse.json({ error: 'Nothing to translate' }, { status: 400 });
    }

    // Connect to local LLM server (e.g., LM Studio / Ollama OpenAI-compatible server)
    const response = await fetch('http://127.0.0.1:1234/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'local-model',
        temperature: 0.1,
        messages: [
          {
            role: 'system',
            content: `You are an expert technical translator for a service marketplace. 
You MUST respond with RAW JSON ONLY. Do NOT include markdown code blocks, backticks, or any conversational filler.
Translate the input into Arabic (Ar), French (Fr), and English (En).

Target schema:
{
  "nameServAr": "...",
  "nameServFr": "...",
  "nameServEn": "...",
  "descrAr": "...",
  "descrFr": "...",
  "descrEn": "..."
}`,
          },
          {
            role: 'user',
            content: `Source Language: ${sourceLang || 'Fr'}
Service Name: "${name || ''}"
Service Description: "${descr || ''}"`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Local LLM Server returned error:', response.status, errText);
      return NextResponse.json(
        { error: `Local LLM returned status ${response.status}: ${errText}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    const rawContent = result.choices?.[0]?.message?.content || '';

    // Extract JSON block using regex in case model includes commentary or code fences
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON object found in LLM response:', rawContent);
      return NextResponse.json(
        { error: 'Local model failed to return a valid JSON format' },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      nameServAr: parsed.nameServAr || '',
      nameServFr: parsed.nameServFr || '',
      nameServEn: parsed.nameServEn || '',
      descrAr: parsed.descrAr || '',
      descrFr: parsed.descrFr || '',
      descrEn: parsed.descrEn || '',
    });
  } catch (error: any) {
    console.error('Translation route error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to connect to local AI server on http://127.0.0.1:1234' },
      { status: 500 }
    );
  }
}