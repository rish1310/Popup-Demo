import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function userQueries(query, userQuery) {
    if (!userQuery) {
        throw new Error('No userQuery provided');
    }

    async function querySummary(query, userQuery) {
        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: `${query}\n${userQuery}`,
                },
            ],
            model: "llama3-8b-8192",
        });
        return response.choices[0]?.message?.content;
    }

    try {
        const response = await querySummary(query, userQuery);
        return response; // Return the processed response
    } catch (error) {
        console.error("Error in query summary:", error);
        throw new Error('Error processing query summary');
    }
}
