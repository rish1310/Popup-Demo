import axios from 'axios';
import xml2json from 'xml2json';
import puppeteer from 'puppeteer';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import pLimit from 'p-limit';
import fs from 'fs';

dotenv.config();
export async function productScraper(url) {


    const userQuery = "How can I treat acne scars?";
    // const url = process.argv[2]; // The URL passed from server.js
    console.log('URL:', url);

    if (!url) {
        console.error('No URL provided');
        process.exit(1);
    }

    // Now you can access the variables like this:
    const basePrompt = "You are a helpful friend who is dermatologist for a skin-products company, trying to help customers understand their skincare problems and suggest some chemical ingredients.";
    const defaultInstructionPrompt = "You will be given a question from a customer and you need to very briefly explain (in under 60-80 words and bullets) why the problem happens, with skincare suggestions and recommended products from the website. The whole answer should be in markdown format. Use the following examples of questions and answers as a reference:";
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
    ]

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const limit = pLimit(10); // Set concurrency limit for parallel requests

    // Function to get Groq chat completion for a given data
    async function getGroqChatCompletion(data) {
        return groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: `${data}\nSummarize the data in 30 to 40 words.`,
                },
            ],
            model: "llama3-8b-8192",
        });
    }

    // Function to fetch sitemap URLs from the target website
    async function fetchUrls(url) {
        const robotsTxtUrl = `${url}/robots.txt`;
        const { data: robotsText } = await axios.get(robotsTxtUrl);
        const sitemapMatch = robotsText.match(/Sitemap:\s*(\S+)/i);
        if (!sitemapMatch) {
            throw new Error("Sitemap not found");
        }
        const sitemapUrl = sitemapMatch[1];
        const { data: sitemapXml } = await axios.get(sitemapUrl);
        const jsonData = JSON.parse(xml2json.toJson(sitemapXml));

        const { data: urlsXml } = await axios.get(jsonData.sitemapindex.sitemap[0].loc);
        return JSON.parse(xml2json.toJson(urlsXml));
    }

    // Function to extract URLs that contain images from the sitemap data
    function extractUrls(parsedData) {
        const urls = parsedData.urlset.url || [];
        return urls.filter(item => item['image:image'] !== undefined);
    }

    // Function to scrape the content of a URL using Puppeteer
    async function scrapeUrl(url, browser) {
        const page = await browser.newPage();
        try {
            await page.goto(url.loc, { waitUntil: 'networkidle2', timeout: 60000 }); // Increased timeout to 60 seconds
            const textContent = await page.evaluate(() => document.body.innerText);
            return textContent;
        } catch (error) {
            console.error(`Failed to scrape ${url.loc}:`, error.message);
            return null; // Return null for failed scrapes
        } finally {
            await page.close();
        }
    }

    // Function to scrape content from multiple URLs concurrently
    async function scrapeUrls(urls) {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const scrapePromises = urls.map(url => limit(() => scrapeUrl(url, browser)));
        const scrapedData = await Promise.all(scrapePromises);

        await browser.close();
        return scrapedData.filter(data => data !== null); // Filter out failed scrapes
    }

    // Function to get Groq chat responses for the scraped content
    async function getGroqResponses(scrapedData) {
        const responsePromises = scrapedData.map(data => getGroqChatCompletion(data));
        const responses = await Promise.all(responsePromises);
        return responses.map(response => response.choices[0]?.message?.content);
    }

    // Function to prepare the final object combining scraped content and Groq responses
    function prepareObject(extractedUrls, groqResponses) {
        return groqResponses.map((response, index) => ({
            imageUrl: extractedUrls[index]['image:image']['image:loc'],
            productTitle: extractedUrls[index]['image:image']['image:title'],
            productDescription: response,
        }));
    }

    // Function to query Groq with the summary of all products
    async function querySummary(query, userQuery) {
        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: `${query}\n${userQuery}`,
                },
            ],
            model: "llama-3.1-70b-versatile",
        });
        return response.choices[0]?.message?.content;
    }

    // Function to get a summary of all products
    function getSummaryOfAllProducts(finalObject) {
        return finalObject.map(item => `${item.productTitle}\n${item.productDescription}`).join(' ');
    }

    // Main function to orchestrate the entire scraping and processing
    let query = "";
    function getSummaryOfAllProducts(finalObject) {
        return finalObject.map(item => `${item.productTitle}\n${item.productDescription}`).join(' ');
    }

    // Main function to orchestrate the entire scraping and processing
    async function main() {
        try {
            const statusFilePath = '/tmp/status.txt';
            const queryResultFilePath = '/tmp/queryResult.txt';
            fs.writeFileSync(statusFilePath, 'Scraping product details...');
            const urls = await fetchUrls(`${url}`);
            const extractedUrls = extractUrls(urls);

            fs.writeFileSync(statusFilePath, 'Summarizing product details...');
            const dataScraped = await scrapeUrls(extractedUrls.slice(0, 50));
            const groqResponses = await getGroqResponses(dataScraped);
            const finalObject = prepareObject(extractedUrls, groqResponses);
            const summaryOfAllProducts = getSummaryOfAllProducts(finalObject);

            const query = `${basePrompt}\n${defaultInstructionPrompt}\n${defaultExampleQuestionsAndAnswers.map(item => item.join("\n")).join("\n")}\n${summaryOfAllProducts}`;
            fs.writeFileSync(queryResultFilePath, query, 'utf8');
            console.log('Query result stored in queryResult.txt');
            return query; // Return the query result if needed
        } catch (error) {
            console.error("Error in main execution:", error);
            throw error; // Propagate the error to be handled in server.js
        }
    }

    return main();
}
// export { query };