import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const userQuery = process.argv[2];
const query = process.argv[3];
if (!userQuery) {
    console.error('No userQuery provided');
    process.exit(1);
}
// console.log(`Received userQuery: ${userQuery}`);

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

async function main() {

    try {
        const response = await querySummary(query, userQuery);
        console.log(response);
    }
    catch (error) {
        console.error("Error in main execution:", error);
    }
}
main();

// const response = async () => {
//     await querySummary(query, userQuery);
// }
// console.log(response);