import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import axios from 'axios';
import { productScraper } from './productScraper.js';
import { userQueries } from './userQueries.js';
import { connectToDatabase, closeDatabaseConnection } from './database-operations.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
let currentStatus = 'Initializing...';
let scrapedContent = null;
let isScraping = false;
let scrapedData = ''; // Store the scraped data here
let productCount = 0;
let currentProductName = '';

app.use(express.static(path.join(process.cwd(), 'public')));
app.use(express.json());

app.get('/fetch', async (req, res) => {
    const targetUrl = req.query.url;

    if (!targetUrl) {
        return res.status(400).send('URL is required');
    }

    res.sendFile(path.join(process.cwd(), 'public', 'loader.html'));

    if (!isScraping) {
        isScraping = true;
        currentStatus = 'Scraping product details...';
        productCount = 0;
        currentProductName = '';

        try {
            scrapedData = await productScraper(targetUrl, (status, product, count) => {
                currentStatus = status;
                currentProductName = product;
                productCount = count;
            });
            console.log("Scraped Data:", scrapedData);
            currentStatus = 'Fetching product details...';

            const response = await axios.get(targetUrl, {
                headers: {
                    'User-Agent': req.get('User-Agent')
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
            scrapedContent = null;
            scrapedData = '';
        } finally {
            isScraping = false;
        }
    }
});

app.get('/status', (req, res) => {
    res.json({
        isScraping,
        status: currentStatus,
        productCount: productCount,
        currentProduct: currentProductName
    });
});

app.get('/content', (req, res) => {
    if (scrapedContent) {
        res.type('text/html');
        res.send(scrapedContent);
        scrapedContent = null; // Clear the content after sending
    } else if (isScraping) {
        res.status(202).send('Scraping in progress');
    } else {
        res.status(500).send('No content available');
    }
});

app.post('/queries', async (req, res) => {
    const userQuery = req.body.userQuery;

    if (!userQuery) {
        return res.status(400).send('userQuery is required');
    }

    if (!scrapedData) {
        return res.status(400).send('No scraped data available. Please fetch a URL first.');
    }

    try {
        const result = await userQueries(scrapedData, userQuery);
        console.log('Processed user query:', result);
        res.send(result);
    } catch (error) {
        console.error(`Error processing user query: ${error.message}`);
        return res.status(500).send('Error processing query');
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

connectToDatabase().then(() => {
    const server = app.listen(PORT, () => {
        const address = server.address();
        const actualPort = typeof address === 'string' ? address : address?.port;
        console.log(`Server running at http://localhost:${actualPort}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${PORT} is busy, trying another port...`);
            server.listen(0); // This will choose a random available port
        } else {
            console.error('Error starting server:', err);
            process.exit(1);
        }
    });
}).catch(error => {
    console.error('Failed to connect to the database. Server not started.', error);
    process.exit(1);
});

process.on('SIGINT', async () => {
    await closeDatabaseConnection();
    process.exit(0);
});