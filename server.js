import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import axios from 'axios';
import { productScraper } from './productScraper.js';
import { userQueries } from './userQueries.js';
import { connectToDatabase, closeDatabaseConnection } from './database-operations.js';
import { Domain } from './mongoose-models.js';
import { getRecommendedProducts } from './chatgpt-utils.js'; // Import your function

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

let currentDomain = ''; // Variable to store the current domain

app.get('/fetch', async (req, res) => {
    let targetUrl = req.query.url;

    if (!targetUrl) {
        return res.status(400).send('URL is required');
    }

    // Remove "www." if it exists in the URL
    targetUrl = targetUrl.replace(/^www\./i, '');

    // Add "https://" to the URL if it does not start with "http://" or "https://"
    if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = `https://${targetUrl}`;
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

            // Extract the domain from the target URL
            const url = new URL(targetUrl);
            currentDomain = url.hostname; // Store the current domain

            // Inject the <script> tag for pop-up.js before the closing </body> tag
            const scriptTag = `<script>
                setTimeout(function() {
                var script = document.createElement('script');
                script.src = '/pop-up.js';
                document.body.appendChild(script);
                }, 5000);
            </script>`;
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

// New route for recommending products
app.post('/recommend-products', async (req, res) => {
    const { userQuery } = req.body;

    if (!userQuery) {
        return res.status(400).send('userQuery is required');
    }

    if (!currentDomain) {
        return res.status(400).send('Current domain is not available. Please fetch a URL first.');
    }

    // Remove the protocol from the currentDomain
    const domainWithoutProtocol = currentDomain.replace(/^https?:\/\//, '');

    try {
        // Fetch product data from MongoDB using the current domain without the protocol
        const domainData = await Domain.findOne({ domain: domainWithoutProtocol });

        if (!domainData || domainData.products.length === 0) {
            return res.status(404).json({ error: 'No products found for this domain.' });
        }

        // Prepare data for ChatGPT function calling
        const chatGPTResponse = await getRecommendedProducts({
            scrapedData: domainData.data,
            userQuery,
            products: domainData.products
        });

        // Respond with the recommended products (max 5)
        const recommendedProducts = chatGPTResponse.recommendedProducts.slice(0, 5);
        res.json({ recommendedProducts });

    } catch (error) {
        console.error('Error during product recommendation:', error);
        res.status(500).json({ error: 'Error recommending products' });
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
