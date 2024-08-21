import express from 'express';
import axios from 'axios';
import path from 'path';
import { exec } from 'child_process';
import fs from 'fs';
import dotenv from 'dotenv';
import { productScraper } from './productScraper.js';
import { userQueries } from './userQueries.js';

const app = express();
const PORT = 3000;
let currentStatus = 'Initializing...';

let queryResult = null;
// In-memory storage for scraped content
let scrapedContent = null;
let isScraping = false;

// Serve static files (like pop-up.js)
app.use(express.static(path.join(process.cwd())));

// Parse incoming request bodies in a middleware before your handlers
app.use(express.json());

// Route to initiate scraping and show the loader
app.get('/fetch', async (req, res) => {
    const targetUrl = req.query.url;

    if (!targetUrl) {
        return res.status(400).send('URL is required');
    }

    // Show the loader page while scraping is happening
    res.sendFile(path.join(process.cwd(), 'loader.html'));

    // Start the scraping process
    if (!isScraping) {
        isScraping = true;
        currentStatus = 'Scraping product details...'; // Update status
        await productScraper(targetUrl);

        // exec(`node productScraper.js "${targetUrl}"`, async (error, stdout, stderr) => {
        // if (error) {
        //     console.error(`Error executing productScraper.js: ${error.message}`);
        //     isScraping = false;
        //     return;
        // }
        // if (stderr) {
        //     console.error(`stderr: ${stderr}`);
        //     isScraping = false;
        //     return;
        // }
        // console.log(`stdout: ${stdout}`);

        // After scraping, update the status
        currentStatus = 'Summarizing product details...';

        try {
            const response = await axios.get(targetUrl, {
                headers: {
                    'User-Agent': req.get('User-Agent') // Forward the User-Agent header to mimic a browser request
                }
            });

            let content = response.data;

            // Inject the <script> tag for pop-up.js before the closing </body> tag
            const scriptTag = `<script src="/pop-up.js"></script>`;
            content = content.replace('</body>', `${scriptTag}</body>`);

            // Store the scraped content
            scrapedContent = content;
            queryResult = fs.readFileSync('queryResult.txt', 'utf8'); // Read the query result from the file
            isScraping = false;
        } catch (fetchError) {
            console.error('Error fetching the target URL:', fetchError);
            isScraping = false;
        }
        // });
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
        const result = await userQueries(queryResult, userQuery); // Call userQueries function
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
