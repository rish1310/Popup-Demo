(function () {

    // Create style element
    const style = document.createElement('style');
    style.textContent = `
        /* Your CSS here */
        .ort-popup-container {
            position: fixed;
            z-index: 2147483647;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(1);
            height: auto;
            width: auto;
            border-radius: 10px;
            overflow: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease;
            opacity: 1;
            visibility: visible;
            animation: expandPopup-right 0.5s ease-out forwards;
            background-color: #fefefef7;
            display: block;
            font-size: 14px;
            font-family: Avenir Next Rounded, sans-serif;
            color: #1f2021;
            font-weight: 400;
            font-style: normal;
            -webkit-font-smoothing: antialiased;
            -webkit-text-size-adjust: 100%;
            text-rendering: optimizeLegibility;
            line-height: 1.563;
            box-sizing: border-box;
        }

        .ort-popup-close-button {
            background: none;
            border: none;
            cursor: pointer;
            position: absolute;
            top: 10px;
            right: 10px;
        }

        .ort-popup-close-icon {
            width: 24px;
            height: 24px;
        }

        .ort-chatbot-block {
            padding: 20px;
        }

        .ort-section-container {
            border: 1px solid rgba(0, 0, 0, 0.250);
            border-left: none;
            border-right: none;
            overflow: hidden;
            margin: 0 auto;
            width: fit-content;
        }

        .ort-chatbot-block {
            display: flex;
            flex-direction: column;
            max-height: 600px;
            max-width: 50vw;
            border: none;
            overflow: hidden;
        }

        .ort-title-container {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .ort-chatbot-title {
            width: 100%;
            color: #333;
            text-align: center;
            font-weight: bold;
            font-size: x-large;
            margin: 0 40px 0 40px;
        }

        .ort-nowrap {
            white-space: nowrap;
        }

        .ort-large-mic-button-container {
            display: flex;
            justify-content: center;
            align-items: center;
            flex-grow: 1;
            flex-direction: column;
            padding-top: 40px;
            padding-bottom: 40px;
            position: relative;
            box-sizing: border-box;
        }

        .ort-large-mic-button {
            background: rgb(255, 255, 255);
            border: 1px solid black;
            border-radius: 100px;
            padding: 0px;
            cursor: pointer;
            transition: width 0.2s, height 0.2s, border-radius 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            max-width: 120px;
            max-height: 120px;
            min-width: 120px;
            min-height: 120px;
        }

        .ort-large-mic-button:hover {
            background: rgba(255, 255, 255, 0.7);
        }

        .ort-large-mic-icon {
            min-width: 60px;
            min-height: 60px;
            max-width: 120px;
            max-height: 120px;
            width: 60px;
            height: 60px;
        }

        .ort-large-mic-loader {
            position: absolute;
            top: calc(50% - 30px);
            left: 50%;
            transform: translate(-50%, -50%);
            border: 6px solid #f3f3f3;
            border-radius: 50%;
            border-top: 6px solid #000;
            width: 40px;
            height: 40px;
            -webkit-animation: spin 2s linear infinite;
            animation: spin 2s linear infinite;
        }

        .ort-chat {
            overflow-y: auto;
            flex-grow: 1;
            padding-right: 10px;
            padding-left: 10px;
            padding-bottom: 10px;
        }

        .ort-user-chat-bubble,
        .ort-chatbot-response-bubble {
            padding-top: 12px;
            padding-bottom: 12px;
            padding-left: 16px;
            padding-right: 16px;
            margin: 10px 10px 0px 0px;
            border-radius: 20px;
            word-wrap: break-word;
            text-align: left;
            align-self: center;
        }

        .ort-user-chat-bubble {
            background-color: #bdbdbdb7;
            color: #000000;
            max-width: 80%;
            align-self: flex-start;
        }

        .ort-chatbot-response-bubble {
            background-color: #e0e0e0b7;
            color: #000000;
            max-width: 100%;
            align-self: flex-end;
        }

        .ort-chatbot-response-bubble h1,
        .ort-chatbot-response-bubble h2,
        .ort-chatbot-response-bubble h3,
        .ort-chatbot-response-bubble h4,
        .ort-chatbot-response-bubble h5,
        .ort-chatbot-response-bubble h6 {
            font-weight: bold !important;
        }

        .ort-chat-input-container {
            display: flex;
            flex-direction: column;
            border: none !important;
            position: relative;
            height: auto;
            margin-left: 5px;
            margin-right: 5px;
        }

        textarea[name="ort-chatInput"] {
            width: 100%;
            padding-top: 7px;
            padding-bottom: 7px;
            padding-left: 10px;
            padding-right: 40px;
            box-sizing: border-box;
            border-radius: 10px;
            height: 2.75em;
            min-height: 2.75em;
            max-height: 2.75em;
            resize: none;
            background-color: #f3f3f3;
            border: none;
        }

        textarea[name="ort-chatInput"]::placeholder {
            color: #999;
            font-style: italic;
            line-height: 1.5;
        }

        .ort-buttons-container {
            position: absolute;
            right: 5px;
            bottom: 2px;
            display: flex;
        }

        .ort-small-mic-button,
        button[name="ort-chatButton"] {
            background: transparent;
            cursor: pointer;
            border: none;
        }

        .ort-small-mic-button[disabled],
        button[name="ort-chatButton"][disabled] {
            cursor: not-allowed;
        }

        .ort-small-mic-icon,
        .ort-submit-icon {
            width: 24px;
            height: 24px;
        }

        .rotating {
            animation: rotate 0.75s linear infinite;
        }

        .ort-loading {
            position: relative;
            pointer-events: none;
        }

        .ort-loading::after {
            content: '';
            position: absolute;
            left: 50%;
            top: 50%;
            width: 20px;
            height: 20px;
            margin: -10px 0 0 -10px;
            border-radius: 50%;
            border: 2px solid #fff;
            border-top-color: #000000ac;
            animation: spin 1s linear infinite;
        }

        #ort-chatbot-block .error {
            color: #b00020;
            padding: 4px;
            margin: 4px;
        }

        .ort-example-queries-container {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            margin: 7px 7px 0px 7px;
        }

        .ort-example-query-button {
            border: black;
            border-radius: 50px;
            padding: 10px 20px;
            margin: 7px 10px 0px 10px;
            cursor: pointer;
            display: inline-flex;
            background-color:#eaeaea;
        }

        .ort-example-query-button:hover {
            background-color: black;
            color: white;
        }

        .ort-carousel-container {
            display: flex;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            gap: 16px;
            -ms-overflow-style: none;
            scrollbar-width: none;
        }

        .ort-carousel-container::-webkit-scrollbar {
            display: none;
        }

        .ort-carousel-item {
            flex: 0 0 auto;
            scroll-snap-align: start;
            width: 200px;
            position: relative;
        }

        .ort-carousel-item img {
            width: 100%;
            height: auto;
            display: block;
        }

        /*.ort-product-name {
            position: absolute;
            top: 0;
            width: 100%;
            color: white;
            text-align: center;
            padding: 4px;
            background-color: rgba(0, 0, 0, 0.5);
        }*/

        .ort-footer {
            position: relative;
            background-color: rgba(120, 120, 120, 0.2);
            color: rgba(0, 0, 0, 0.4);
            padding: 10px 20px;
            max-width: 100%;
            font-size: 0.75em;
            margin: 0 auto;
            height: 2.0em;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .ort-footer a {
            text-decoration: none;
            color: inherit;
        }

        @keyframes expandPopup-right {
            0% {
                transform: translate(calc(100vw - 10px), calc(100vh - 10px)) scale(0);
                opacity: 0;
            }

            100% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
        }

        @keyframes shrinkPopup-right {
            0% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }

            100% {
                transform: translate(calc(100vw - 10px), calc(100vh - 10px)) scale(0);
                opacity: 0;
            }
        }

        @keyframes expandPopup-left {
            0% {
                transform: translate(calc(-150vw + 10px), calc(100vh - 10px)) scale(0);
                opacity: 0;
            }

            100% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
        }

        @keyframes shrinkPopup-left {
            0% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }

            100% {
                transform: translate(calc(-150vw + 10px), calc(100vh - 10px)) scale(0);
                opacity: 0;
            }
        }

        @-webkit-keyframes spin {
            0% {
                -webkit-transform: rotate(0deg);
            }

            100% {
                -webkit-transform: rotate(360deg);
            }
        }

        @keyframes spin {
            0% {
                transform: rotate(0deg);
            }

            100% {
                transform: rotate(360deg);
            }
        }

        @media (max-width: 768px) {
            .ort-popup-container {
                border-radius: 20px 20px 0 0;
                top: auto;
                bottom: 0;
                transform: translate(-50%, 0) scale(0);
            }

            @keyframes expandPopup-right {
                0% {
                    transform: translate(calc(50vw - 10px), calc(100vh - 10px)) scale(0);
                    opacity: 0;
                }

                100% {
                    transform: translate(-50%, 0) scale(1);
                    opacity: 1;
                }
            }

            @keyframes shrinkPopup-right {
                0% {
                    transform: translate(-50%, 0) scale(1);
                    opacity: 1;
                }

                100% {
                    transform: translate(calc(50vw - 10px), calc(100vh - 10px)) scale(0);
                    opacity: 0;
                }
            }

            @keyframes expandPopup-left {
                0% {
                    transform: translate(calc(-125vw + 10px), calc(100vh - 10px)) scale(0);
                    opacity: 0;
                }

                100% {
                    transform: translate(-50%, 0) scale(1);
                    opacity: 1;
                }
            }

            @keyframes shrinkPopup-left {
                0% {
                    transform: translate(-50%, 0) scale(1);
                    opacity: 1;
                }

                100% {
                    transform: translate(calc(-125vw + 10px), calc(100vh - 10px)) scale(0);
                    opacity: 0;
                }
            }

            .ort-chatbot-block {
                height: auto;
                min-height: 0px;
                max-height: 80vh;
            }

            .ort-chatbot-title {
                font-size: larger;
            }

            .ort-chat {
                padding-right: 0px;
                padding-left: 0px;
            }

            .ort-user-chat-bubble,
            .ort-chatbot-response-bubble {
                margin-right: 0px;
            }

            .ort-example-query-button {
                font-size: smaller;
            }
                .ort-recommended-products-container {
    display: flex;
    overflow-x: auto; /* Enable horizontal scrolling */
    padding: 10px; /* Optional: Add some padding */
    gap: 10px; /* Optional: Add gap between product cards */
}

.ort-product-card {
    min-width: 150px !important; /* Set a minimum width for product cards */
    max-width: 150px !important; /* Set a maximum width for product cards */
    flex-shrink: 0 !important; /* Prevent shrinking of product cards */
    background-color: #f9f9f9 !important; /* Optional: Add background color */
    border: 1px solid #ddd !important; /* Optional: Add a border */
    border-radius: 5px !important; /* Optional: Add rounded corners */
    padding: 5px !important; /* Reduce padding inside cards */
    text-align: center !important; /* Center text inside cards */
    overflow: hidden !important; /* Prevent overflow of contents */
}

.ort-product-image {
    width: 100% !important; /* Make the image responsive */
    height: auto !important; /* Maintain aspect ratio */
    max-height: 150px !important; /* Set a maximum height for images */
    object-fit: contain !important; /* Ensure the image fits within the card without distortion */
}

.ort-product-name {
    text-align: center !important; /* Center the product name */
    font-size: 14px !important; /* Adjust font size as needed */
    margin: 5px 0 0 0 !important; /* Add some margin above the product name */
}

.ort-loader {
    margin: 10px 0; /* Adjust margin as needed */
    display: flex; /* Use flexbox to center the spinner */
    justify-content: center; /* Center align spinner horizontally */
    align-items: center; /* Center align spinner vertically */
}

.spinner {
    border: 4px solid rgba(255, 255, 255, 0.3); /* Light border for spinner */
    border-top: 4px solid #3498db; /* Blue color for spinner */
    border-radius: 50%; /* Make it round */
    width: 30px; /* Size of the spinner */
    height: 30px; /* Size of the spinner */
    animation: spin 1s linear infinite; /* Spin animation */
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}


    `;
    document.head.appendChild(style);

    // Create HTML elements
    const popupContainer = document.createElement('div');
    popupContainer.id = 'ort-popup-container-popup-854395';
    popupContainer.className = 'ort-popup-container ort-show-popup';
    popupContainer.style.display = 'none'; // Initially hidden

    popupContainer.innerHTML = `
        <!-- Your HTML content here -->
        <!-- <button class="ort-popup-close-button">
            <img src="https://cdn.shopify.com/extensions/ea356b32-b769-4e79-91d4-a2945ce01fa9/skinny-ai-assistant-34/assets/close-circle.svg"
                alt="Close icon" class="ort-popup-close-icon" width="24px" height="24px" loading="lazy">
        </button> -->
        <div class="ort-chatbot-block" id="ort-chatbot-block-popup-854395">
            <div class="ort-title-container">
                <div class="ort-chatbot-title">
                    <span class="ort-nowrap">Uncertain about skincare?</span>
                    <span class="ort-nowrap">Let us guide you!</span>
                </div>
            </div>
            <div class="ort-chat" style="display: none;">
                <!-- Chat history will go here -->
            </div>
            <div class="ort-large-mic-button-container">
                <button class="ort-large-mic-button" id="ort-large-mic-button-popup-854395">
                    <img class="ort-large-mic-icon"
                        src="https://cdn.shopify.com/extensions/ea356b32-b769-4e79-91d4-a2945ce01fa9/skinny-ai-assistant-34/assets/microphone.svg"
                        alt="Large microphone icon" width="auto" height="auto" loading="lazy">
                </button>
                <p class="ort-large-mic-text">Tap to ask!</p>
            </div>
            <div class="ort-chat-input-container">
                <textarea name="ort-chatInput" type="text" class="ort-chat-input"
                    placeholder="Ask away your skincare question" autocomplete="off"></textarea>
                <div class="ort-buttons-container">
                    <button class="ort-small-mic-button" style="display: none;">
                        <img src="https://cdn.shopify.com/extensions/ea356b32-b769-4e79-91d4-a2945ce01fa9/skinny-ai-assistant-34/assets/microphone.svg"
                            alt="Small microphone icon" class="ort-small-mic-icon" width="auto" height="auto"
                            loading="lazy">
                    </button>
                    <button name="ort-chatButton" class="ort-chat-button" type="submit"
                        style="display: none;">
                        <img src="https://cdn.shopify.com/extensions/ea356b32-b769-4e79-91d4-a2945ce01fa9/skinny-ai-assistant-34/assets/plane.svg"
                            alt="Plane submit icon" class="ort-submit-icon" width="auto" height="auto" loading="lazy">
                    </button>
                </div>
            </div>
            <div class="ort-example-queries-container">
                <button class="ort-example-query-button ort-example-query-button-popup-854395">What products are
                    suitable for sensitive skin?</button>
                <button class="ort-example-query-button ort-example-query-button-popup-854395">How can I treat acne
                    scars?</button>
                <button class="ort-example-query-button ort-example-query-button-popup-854395">I have fine lines and
                    wrinkles. What should I use?</button>
            </div>
        </div>
        <div class="ort-footer">
            <a href="http://skinny.buywithai.shop" target="_blank">Powered by Skinny AI</a>
        </div> 
    `;

    // Copy the Url of the website automatically and paste it in the prompt box
    const url = window.location.href;

    // Append the popup to the body
    document.body.appendChild(popupContainer);

    // Add event listeners and other functionality
    // const closeButton = popupContainer.querySelector('.ort-popup-close-button');
    // closeButton.addEventListener('click', () => {
    //     popupContainer.style.display = 'none';
    // });

    function darkenColor(rgba, amount) {
        // Extract RGBA values from the rgba string
        const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (!match) return rgba;

        let [r, g, b, a] = match.slice(1).map(Number);

        // Darken the RGB values
        r = Math.max(0, r - amount);
        g = Math.max(0, g - amount);
        b = Math.max(0, b - amount);

        // Ensure alpha is in the range 0-1
        a = a !== undefined ? a : 1;

        // Return new RGBA color
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }

    function updatePopupTheme({
        backgroundColor = 'rgba(254, 254, 254, 0.97)',
        footerColorAmount = 40
    }) {
        const popupContainer = document.querySelector('.ort-popup-container');
        const footer = document.querySelector('.ort-footer');
        const footerColor = darkenColor(backgroundColor, footerColorAmount);

        popupContainer.style.backgroundColor = backgroundColor;
        footer.style.backgroundColor = footerColor;
    }
    const bgColor = 'rgba(254, 254, 254, 0.97)';
    // Prompt for background color and update the popup
    // const bgColor = prompt("Enter the background color in rgba format (e.g., rgba(255, 255, 255, 0.9)):", "rgba(255, 255, 255, 0.9)");
    // Prompt for user query
    // let userQuery = prompt("Ask away your skincare question:");
    let userQuery;

    // chrome.storage.local.get(['bgColor'], ({ bgColor }) => {
    if (bgColor) {
        updatePopupTheme({
            backgroundColor: bgColor,
            footerColorAmount: 40 // Adjust as needed
        });
    }
    // })

    function convertMarkdownToHtml(markdown) {
        // Basic Markdown to HTML conversion
        let html = markdown
            .replace(/^### (.*)$/gm, '<h3>$1</h3>') // Headers
            .replace(/^## (.*)$/gm, '<h2>$1</h2>')
            .replace(/^# (.*)$/gm, '<h1>$1</h1>')
            .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>') // Bold
            .replace(/\*(.*)\*/g, '<em>$1</em>') // Italics
            .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" />') // Images
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>') // Links
            .replace(/(^|\s)\d+\.\s(.*?)(?=\n|$)/g, '<ol><li>$2</li></ol>') // Ordered lists
            .replace(/(^|\s)\*\s(.*?)(?=\n|$)/g, '<ul><li>$2</li></ul>') // Unordered lists
            .replace(/\n/g, '<br>'); // New lines

        // Remove empty list tags
        html = html.replace(/<ol>\s*<\/ol>/g, '');
        html = html.replace(/<ul>\s*<\/ul>/g, '');

        return html;
    }

    // Arrays to store the user queries and responses
    const conversationHistory = [];

    // Inside the existing sendQueryToServer function or after its call
    async function fetchRecommendedProducts(userQuery) {
        try {
            const response = await fetch('/recommend-products', {
                method: 'POST', // Change to POST
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userQuery }) // Include userQuery in the request body
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json(); // Parse the JSON response
            console.log('Recommended Products:', data.recommendedProducts); // Log the recommended products
            return data.recommendedProducts; // Return the recommended products array
        } catch (error) {
            console.error('There was a problem with fetching recommended products:', error);
            return [];
        }
    }


    async function displayChatResponse(userQuery, chatResponse) {
        const chatContainer = popupContainer.querySelector('.ort-chat');
        chatContainer.style.display = 'block';

        // Create user bubble
        const userBubble = document.createElement('div');
        userBubble.className = 'ort-user-chat-bubble';
        userBubble.innerHTML = `<p>${userQuery}</p>`;
        chatContainer.appendChild(userBubble);

        // Create response bubble
        const responseBubble = document.createElement('div');
        responseBubble.className = 'ort-chatbot-response-bubble';
        responseBubble.innerHTML = convertMarkdownToHtml(chatResponse);
        chatContainer.appendChild(responseBubble);

        // Hide unnecessary elements
        document.querySelector('.ort-title-container').style.display = 'none';
        document.querySelector('.ort-large-mic-button-container').style.display = 'none';
        document.querySelector('.ort-example-queries-container').style.display = 'none';

        // // Create loader element with spinner
        // const loader = document.createElement('div');
        // loader.className = 'ort-loader';
        // loader.innerHTML = `<div class="spinner"></div>`;
        // loader.style.textAlign = 'center'; // Center align the spinner
        // chatContainer.appendChild(loader); // Append loader to chat container

        // // Fetch recommended products
        // const recommendedProducts = await fetchRecommendedProducts(userQuery);
        // console.log('Recommended Products:', recommendedProducts);

        // // Remove loader after fetching products
        // chatContainer.removeChild(loader);

        // // Display recommended products in a scrollable row
        // const productContainer = document.createElement('div');
        // productContainer.className = 'ort-recommended-products-container';

        // // Set display to flex for horizontal layout
        // productContainer.style.display = 'flex';
        // productContainer.style.overflowX = 'auto'; // Enable horizontal scrolling
        // productContainer.style.padding = '10px'; // Optional: Add some padding
        // productContainer.style.gap = '10px'; // Optional: Add gap between product cards

        // recommendedProducts.forEach(product => {
        //     const productCard = document.createElement('div');
        //     productCard.className = 'ort-product-card';
        //     productCard.style.maxWidth = '150px'; // Set a maximum width for product cards
        //     productCard.style.flexShrink = '0'; // Prevent shrinking of product cards
        //     productCard.innerHTML = `
        //         <a href="${product.pageLink}" target="_blank">
        //             <img src="${product.imageLink}" alt="${product.name}" class="ort-product-image" />
        //             <p class="ort-product-name" style="margin-top: 5px;">${product.name}</p>
        //         </a>
        //     `;
        //     productContainer.appendChild(productCard);
        // });

        // chatContainer.appendChild(productContainer); // Append the product cards to chat container
    }





    popupContainer.style.display = 'block'; // Show the popup
    let chatResponse = '';
    async function sendQueryToServer(query) {
        try {
            const response = await fetch('/queries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userQuery: query })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.text(); // Assuming the server responds with plain text
            // console.log('Server Response:', data); // Log the response from the server
            chatResponse = data; // Store the response in chatResponse
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    }

    // Event listeners to handle example query buttons
    const exampleButtons = popupContainer.querySelectorAll('.ort-example-query-button');
    exampleButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const userQuery = event.target.innerText; // Get the query from the button's text
            console.log('User Query updated to:', userQuery); // For debugging
            await sendQueryToServer(userQuery); // Send the query to the server
            console.log('Chat Response:', chatResponse); // For debugging
            conversationHistory.push({ userQuery, chatResponse }); // Store the query and response
            displayChatResponse(userQuery, chatResponse);
        });
    });

    // Add event listener to the textarea
    const chatInput = popupContainer.querySelector('.ort-chat-input');
    const chatButton = popupContainer.querySelector('.ort-chat-button');

    chatInput.addEventListener('input', () => {
        if (chatInput.value.trim().length > 0) {
            chatButton.style.display = 'block'; // Show the chat button
        } else {
            chatButton.style.display = 'none'; // Hide the chat button if input is cleared
        }
    });

    // Store userQuery when the user presses Enter or clicks the chat button
    chatInput.addEventListener('keypress', async (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent the default action of submitting the form
            userQuery = chatInput.value.trim(); // Store the value of the textarea in userQuery
            console.log('User Query submitted via Enter:', userQuery); // For debugging
            await sendQueryToServer(userQuery); // Send the query to the server
            console.log('Chat Response:', chatResponse); // For debugging
            conversationHistory.push({ userQuery, chatResponse }); // Store the query and response
            displayChatResponse(userQuery, chatResponse);
            chatInput.value = ''; // Clear the textarea after submission
            chatButton.style.display = 'none'; // Hide the chat button
        }
    });

    chatButton.addEventListener('click', async () => {
        userQuery = chatInput.value.trim(); // Store the value of the textarea in userQuery
        console.log('User Query submitted via button:', userQuery); // For debugging
        await sendQueryToServer(userQuery); // Send the query to the server
        console.log('Chat Response:', chatResponse); // For debugging
        conversationHistory.push({ userQuery, chatResponse }); // Store the query and response
        displayChatResponse(userQuery, chatResponse);
        chatInput.value = ''; // Clear the textarea after submission
        chatButton.style.display = 'none'; // Hide the chat button
    });
})();