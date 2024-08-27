import express from 'express';
import axios from 'axios';
import path from 'path';
import dotenv from 'dotenv';
import { productScraper } from './productScraper.js';
import { userQueries } from './userQueries.js';

const app = express();
const PORT = 3000;
let currentStatus = 'Initializing...';

// In-memory storage for scraped content
let scrapedContent = null;
let isScraping = false;
let query = '';

// Serve static files (like pop-up.js)
app.use(express.static(path.join(process.cwd())));

// Parse incoming request bodies
app.use(express.json());

// Route to initiate scraping and show the loader
app.get('/fetch', async (req, res) => {
    const targetUrl = req.query.url;

    if (!targetUrl) {
        return res.status(400).send('URL is required');
    }

    // Show the loader page while scraping is happening
    res.sendFile(path.join(process.cwd(), 'loader.html'));

    if (!isScraping) {
        isScraping = true;
        currentStatus = 'Scraping product details...'; // Update status

        try {
            // Call productScraper function
            query = await productScraper(targetUrl);
            console.log("Query Details:", query);
            currentStatus = 'Fetching product details...';

            const response = await axios.get(targetUrl, {
                headers: {
                    'User-Agent': req.get('User-Agent') // Forward the User-Agent header
                }
            });

            let content = response.data;

            // Inject the <script> tag for pop-up.js before the closing </body> tag
            const scriptTag = `<script src="/pop-up.js"></script>`;
            content = content.replace('</body>', `${scriptTag}</body>`);

            // Store the scraped content
            scrapedContent = content;
            currentStatus = 'Scraping completed.';
        } catch (fetchError) {
            console.error('Error during scraping or fetching:', fetchError);
            currentStatus = 'Error occurred during scraping.';
            scrapedContent = null; // Reset scrapedContent on error
        } finally {
            isScraping = false; // Ensure the scraping flag is reset
        }
    }
});

app.get('/status', (req, res) => {
    res.json({ isScraping, status: currentStatus });
});

// Route to check if scraping is done and get the content
app.get('/content', (req, res) => {
    if (scrapedContent) {
        res.send(scrapedContent);
        scrapedContent = null; // Clear the content after sending
    } else if (isScraping) {
        res.status(202).send('Scraping in progress'); // 202 Accepted status
    } else {
        res.status(500).send('No content available');
    }
});

// Route to handle user queries
app.post('/queries', async (req, res) => {
    const userQuery = req.body.userQuery;

    if (!userQuery) {
        return res.status(400).send('userQuery is required');
    }

    try {
        // console.log(scrapedContent);
        const result = await userQueries(query, userQuery); // Call userQueries function
        console.log('Processed user query:', result);
        res.send(result);
    } catch (error) {
        console.error(`Error processing user query: ${error.message}`);
        return res.status(500).send('Error processing query');
    }
});

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
