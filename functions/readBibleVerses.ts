import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { passage } = await req.json();

        // Fetch Bible verses from Bible API
        const bibleResponse = await fetch(`https://bible-api.com/${encodeURIComponent(passage)}?translation=web`);
        const bibleData = await bibleResponse.json();

        if (!bibleData.text) {
            return Response.json({ error: 'Could not fetch Bible verses' }, { status: 400 });
        }

        // Simplify the text for kids
        const simplifiedPrompt = `Rewrite this Bible passage in very simple, kid-friendly language (ages 6-10). Keep it short and easy to understand, like telling a story to a child:

${bibleData.text}

Make it engaging and fun, but keep the important message!`;

        const simplified = await base44.integrations.Core.InvokeLLM({
            prompt: simplifiedPrompt,
            response_json_schema: {
                type: "object",
                properties: {
                    kid_friendly_text: { type: "string" }
                }
            }
        });

        // Generate audio using ElevenLabs
        const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
        
        if (!ELEVENLABS_API_KEY) {
            // Fallback to simple text if no API key
            return Response.json({ 
                text: simplified.kid_friendly_text,
                audio_url: null 
            });
        }

        // Use Bella - soft, young female voice perfect for kids
        const voiceId = "EXAVITQu4vr4xnSDxMaL"; // Bella
        
        const audioResponse = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'xi-api-key': ELEVENLABS_API_KEY
                },
                body: JSON.stringify({
                    text: simplified.kid_friendly_text,
                    model_id: "eleven_turbo_v2_5",
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.8,
                        style: 0.4,
                        use_speaker_boost: true
                    }
                })
            }
        );

        if (!audioResponse.ok) {
            return Response.json({ 
                text: simplified.kid_friendly_text,
                audio_url: null 
            });
        }

        const audioBlob = await audioResponse.arrayBuffer();
        
        // Upload audio to storage
        const audioFile = new File([audioBlob], 'bible-audio.mp3', { type: 'audio/mpeg' });
        const uploadResult = await base44.integrations.Core.UploadFile({ file: audioFile });

        return Response.json({ 
            text: simplified.kid_friendly_text,
            audio_url: uploadResult.file_url,
            passage: passage
        });

    } catch (error) {
        console.error('Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});