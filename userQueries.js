import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function userQueries(query, userQuery) {
    if (!userQuery) {
        throw new Error('No userQuery provided');
    }

    async function querySummary(query, userQuery) {
        const response = await openai.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: `${query}\n${userQuery}`,
                },
            ],
            model: "gpt-4o-mini",
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
