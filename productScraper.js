import axios from 'axios';
import xml2json from 'xml2json';
import puppeteer from 'puppeteer';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import pLimit from 'p-limit';
import fs from 'fs';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function productScraper(url) {

    const userQuery = "How can I treat acne scars?";
    console.log('URL:', url);

    if (!url) {
        console.error('No URL provided');
        process.exit(1);
    }

    const basePrompt = "You are a helpful friend who is a dermatologist for a skin-products company, trying to help customers understand their skincare problems and suggest some chemical ingredients.";
    const defaultInstructionPrompt = "You will be given a question from a customer and you need to very briefly explain (in under 60-80 words and bullets) why the problem happens, with skincare suggestions in markdown format.";
    const defaultExampleQuestionsAndAnswers = [
        [
            "I am a 28-year-old male working in the IT industry and travel daily on an auto rickshaw through 14 km of traffic. I experience a lot of pollution and am suffering from pimples and acne. What should I do?",
            "### Understand Your Acne:\n\nI understand you're dealing with pimples and acne, which occur when pores on your skin get blocked.\n\n### Why acne occurs and what you could do:\n\n* **Dirt and Pollution:** Use a barrier cream to protect against pollution.\n* **Germs on Your Skin:** Consider a cream with benzoyl peroxide to target P. acnes bacteria.\n* **Too Much Skin Oil:** Products with salicylic acid can help manage excess oil.\n* **Makeup Products:** If applicable, choose non-comedogenic products.\n\nRemember to clean your skin gently, protect it from the sun, and try the recommended products below.\n\nConsider this as friendly advice and consult a professional dermatologist for any serious problems."
        ],
        [
            "I am a 42-year-old woman with wrinkles. What should I do?",
            "### Understanding Your Wrinkles:\n\nWrinkles are a natural part of aging, resulting from decreased skin elasticity and moisture.\n\n### Why wrinkles occur and what you can do:\n\n* **Aging:** Use products with retinoids to boost collagen production.\n* **Sun Exposure:** Apply broad-spectrum sunscreen daily.\n* **Hydration:** Incorporate a hyaluronic acid serum into your routine.\n* **Lifestyle Factors:** Maintain a balanced diet and regular exercise.\n* **Skin Care Routine:** Follow a consistent routine tailored to aging skin.\n\nConsider gentle exfoliation and avoiding harsh facial expressions to manage wrinkles.\n\nConsider this as friendly advice and consult a professional dermatologist for any serious problems."
        ],
        [
            "Should I visit Thailand or Dubai for a staycation?",
            "### I can help you with any skincare-related problems.\n\nHowever, if you're visiting these places, you could ask me alternative questions below:\n\n* For Thailand beach weather in January, which SPF sunscreen is best suited?\n* Does Dubai weather need any special moisturizers for skin hydration?"
        ]
    ];

    const limit = pLimit(10); // Set concurrency limit for parallel requests

    async function getOpenAIChatCompletion(data) {
        try {
            const response = await openai.chat.completions.create({
                messages: [
                    {
                        role: "user",
                        content: `${data}\nSummarize the data in 30 to 40 words.`,
                    },
                ],
                model: "gpt-4o-mini",
            });
            return response.choices[0]?.message?.content || "No response content";
        } catch (error) {
            console.error('Error with OpenAI API:', error);
            return "Error summarizing data";
        }
    }

    async function fetchUrls(url) {
        try {
            const robotsTxtUrl = `${url}/robots.txt`;
            const { data: robotsText } = await axios.get(robotsTxtUrl);
            const sitemapMatch = robotsText.match(/Sitemap:\s*(\S+)/i);
            if (!sitemapMatch) {
                throw new Error("Sitemap not found in robots.txt");
            }
            const sitemapUrl = sitemapMatch[1];
            const { data: sitemapXml } = await axios.get(sitemapUrl);
            const jsonData = JSON.parse(xml2json.toJson(sitemapXml));

            if (!jsonData.sitemapindex || !jsonData.sitemapindex.sitemap) {
                throw new Error("Invalid sitemap data");
            }
            const { data: urlsXml } = await axios.get(jsonData.sitemapindex.sitemap[0].loc);
            return JSON.parse(xml2json.toJson(urlsXml));
        } catch (error) {
            console.error('Error fetching or parsing URLs:', error);
            throw error;
        }
    }

    function extractUrls(parsedData) {
        const urls = parsedData.urlset?.url || [];
        return urls.filter(item => item['image:image']);
    }

    async function scrapeUrl(url, browser) {
        const page = await browser.newPage();
        try {
            await page.goto(url.loc, { waitUntil: 'networkidle2', timeout: 60000 });
            const textContent = await page.evaluate(() => document.body.innerText);
            return textContent;
        } catch (error) {
            console.error(`Failed to scrape ${url.loc}:`, error.message);
            return null;
        } finally {
            await page.close();
        }
    }

    async function scrapeUrls(urls) {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const scrapePromises = urls.map(url => limit(() => scrapeUrl(url, browser)));
        const scrapedData = await Promise.all(scrapePromises);

        await browser.close();
        return scrapedData.filter(data => data !== null);
    }

    async function getOpenAIResponses(scrapedData) {
        const responsePromises = scrapedData.map(data => getOpenAIChatCompletion(data));
        return Promise.all(responsePromises);
    }

    function prepareObject(extractedUrls, openAIResponses) {
        return openAIResponses.map((response, index) => ({
            imageUrl: extractedUrls[index]['image:image']['image:loc'],
            productTitle: extractedUrls[index]['image:image']['image:title'],
            productDescription: response,
        }));
    }

    function getSummaryOfAllProducts(finalObject) {
        return finalObject.map(item => `${item.productTitle}\n${item.productDescription}`).join(' ');
    }

    async function main() {
        try {
            fs.writeFileSync('status.txt', 'Scraping product details...');
            const urls = await fetchUrls(url);
            const extractedUrls = extractUrls(urls);

            fs.writeFileSync('status.txt', 'Summarizing product details...');
            const dataScraped = await scrapeUrls(extractedUrls.slice(0, 50));
            const openAIResponses = await getOpenAIResponses(dataScraped);
            const finalObject = prepareObject(extractedUrls, openAIResponses);
            const summaryOfAllProducts = getSummaryOfAllProducts(finalObject);

            const query = `${basePrompt}\n${defaultInstructionPrompt}\n${defaultExampleQuestionsAndAnswers.map(item => item.join("\n")).join("\n")}\n${summaryOfAllProducts}`;
            fs.writeFileSync('queryResult.txt', query, 'utf8');
            console.log('Query result stored in queryResult.txt');
            return query;
        } catch (error) {
            console.error("Error in main execution:", error);
            throw error;
        }
    }

    return main();
}
