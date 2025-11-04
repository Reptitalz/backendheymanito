
'use server';
/**
 * @fileOverview The main AI processing pipeline for the WhatsApp assistant.
 * This flow acts as an advanced agent, capable of using tools to perform tasks.
 *
 * - assistantFlow: The primary flow that handles incoming messages (text or audio),
 *   processes them through an agentic model, and returns a text and audio response.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import wav from 'wav';

// Define the input schema for the main flow
const AssistantInputSchema = z.object({
  userId: z.string().describe('The unique identifier for the user session.'),
  text: z.string().optional().describe('The text message from the user.'),
  audio: z.string().optional().describe("A Base64 encoded audio data URI from the user."),
});
export type AssistantInput = z.infer<typeof AssistantInputSchema>;

// Define the output schema for the main flow
const AssistantOutputSchema = z.object({
  replyText: z.string().describe('The text response from the AI assistant.'),
  replyAudio: z.string().describe('The Base64 encoded audio data URI for the AI response.'),
});
export type AssistantOutput = z.infer<typeof AssistantOutputSchema>;

// A simple in-memory store for conversation history.
// In a production app, you'd replace this with a database (Firestore, Redis, etc.).
const conversationHistory: Record<string, { role: 'user' | 'model'; parts: { text: string }[] }[]> = {};

/**
 * Converts PCM audio buffer to WAV format as a Base64 string.
 */
async function toWav(pcmData: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels: 1,
      sampleRate: 24000,
      bitDepth: 16,
    });

    const buffers: any[] = [];
    writer.on('data', (chunk) => buffers.push(chunk));
    writer.on('end', () => resolve(Buffer.concat(buffers).toString('base64')));
    writer.on('error', reject);

    writer.end(pcmData);
  });
}


/**
 * The main flow that processes incoming messages, whether text or audio.
 */
export const assistantFlow = ai.defineFlow(
  {
    name: 'assistantFlow',
    inputSchema: AssistantInputSchema,
    outputSchema: AssistantOutputSchema,
  },
  async (input) => {
    let userMessage = input.text;

    // 1. Speech-to-Text: If audio is provided, transcribe it.
    if (input.audio) {
      console.log('Audio received, transcribing...');
      const transcribeResponse = await ai.generate({
        model: googleAI.model('gemini-pro-vision'),
        prompt: {
            text: "Transcribe the following audio.",
            media: { url: input.audio }
        },
      });
      userMessage = transcribeResponse.text;
      console.log(`Transcription result: "${userMessage}"`);
    }

    if (!userMessage) {
        throw new Error("Input text is empty after transcription.");
    }
    
    // 2. Conversation History Management
    if (!conversationHistory[input.userId]) {
        conversationHistory[input.userId] = [];
    }
    conversationHistory[input.userId].push({ role: 'user', parts: [{ text: userMessage }] });

    // 3. AI Agent Response Generation
    console.log('Generating response with Gemini Agent...');
    const model = googleAI.model('gemini-pro');
    const result = await model.generate({
        system: "You are an advanced AI assistant. Your primary goal is to be helpful and perform tasks for the user. When a user asks you to do something, use the tools available to you to accomplish the task. If no specific tool is required, answer as a helpful assistant.",
        history: conversationHistory[input.userId],
        prompt: userMessage
    });

    const replyText = result.text;
    console.log(`Gemini response: "${replyText}"`);
    
    // Add AI response to history
    conversationHistory[input.userId].push({ role: 'model', parts: [{ text: replyText }] });

    // 4. Text-to-Speech (Google TTS)
    console.log('Generating speech with TTS model...');
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      prompt: replyText,
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
    });

    if (!media) {
      throw new Error('TTS model did not return any audio.');
    }
    
    const audioBuffer = Buffer.from(media.url.substring(media.url.indexOf(',') + 1), 'base64');
    const wavBase64 = await toWav(audioBuffer);
    const replyAudio = `data:audio/wav;base64,${wavBase64}`;
    console.log('Speech generated successfully.');

    return {
      replyText,
      replyAudio,
    };
  }
);
