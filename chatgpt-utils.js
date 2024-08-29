import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function getRecommendedProducts({ scrapedData, userQuery, products }) {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: 'You are a helpful assistant that recommends products based on user queries and available products.' },
            { role: 'user', content: `Data: ${scrapedData}` },
            { role: 'user', content: `Query: ${userQuery}` },
            { role: 'user', content: `Available Products: ${JSON.stringify(products)}` }
        ],
        functions: [
            {
                name: 'recommendProducts',
                description: 'Recommends products based on user query and available products',
                parameters: {
                    type: 'object',
                    properties: {
                        recommendedProducts: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    pageLink: { type: 'string' },
                                    imageLink: { type: 'string' }
                                }
                            }
                        }
                    },
                    required: ['recommendedProducts']
                }
            }
        ],
        function_call: { name: 'recommendProducts' },
    });

    const functionResponse = response.choices[0].message.function_call;
    const recommendedProducts = JSON.parse(functionResponse.arguments).recommendedProducts;
    return { recommendedProducts };
}
