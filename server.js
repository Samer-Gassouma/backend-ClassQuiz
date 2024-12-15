const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;
const apiKey = 'AIzaSyACgXOopJEgp8BsoyybGhBAWWxnDVvoMGE';
// Replace with your actual Page Access Token
//const PAGE_ACCESS_TOKEN = 'EAAPZB0lL9wr8BOwCx0R6qWjCyqeoGPYHLEJ05FoymV6QlZCzw4ZAd6gxplqvZAY58mEwVucZBgbdwZBRdWIvxD5YVzAnhHZCZCPThM8i0G91lTEwjCMvsfialnFg7KxfvRBSfnXxQw6t5h1J85HHbOruC4BIwKGQxreezjU5Jwo3bL4I6VFEeatSxav9kkEgjzlZCBDQg7dIfw0iKXT0QwR6yZB4cynS4ZD';

// Function to analyze complaint using Gemini API
async function analyzeComplaint(complaintText) {
    const { GoogleGenerativeAI } = require("@google/generative-ai");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Define the labels you want to classify into
    const labels = ["Tech", "Payment Problems", "Content Problems", "UX Problems", "UI"];
    
    // Create a prompt for the AI to classify the complaint
    const prompt = `Classify the following complaint into one of these labels: ${labels.join(", ")}. Complaint: "${complaintText}". Return only the label in one word.`;

    try {
        const result = await model.generateContent(prompt);
        const label = result.response.text().trim(); // Get the response and trim whitespace
        
        // Log the AI's response for debugging
        console.log(`AI Response: ${label} for complaint: "${complaintText}"`);
        
        return labels.includes(label) ? label : 'Unlabeled'; // Return the label if valid, otherwise 'Unlabeled'
    } catch (error) {
        console.error('Error analyzing complaint:', error);
        return 'Unlabeled'; // Default to 'Unlabeled' on error
    }
}

// Route to get Facebook Messenger conversations
app.get('/get-messenger-conversations', async (req, res) => {
    const accessToken = 'EAAPZB0lL9wr8BOZB1QdqeD9EEis5NpZBNnqHIMBVHgXAnTgvZCjbycldTHq8OCHXNBKHVedHfSrMUblVIW45ZAbuhIBR1BEuhUzdz19PMl92HzBXJACzPmfGnQmcx7Lzf4xJZBdZAEjVTUgMAaMHgO4xpuafNibjYZAk0VcLycDtpwF3tlBRgzjIY0qWgZAZAkbBjZCt8ZBexakWzPqyb5qdQhXehm97'; // Use your access token

    try {
        // API call to retrieve conversations
        const response = await axios.get(`https://graph.facebook.com/v21.0/me/conversations`, {
            params: {
                access_token: accessToken,
                fields: 'id,link,updated_time',
            },
        });

        // Send the conversation data as JSON
        res.json(response.data);
    } catch (error) {
        console.error('Error retrieving conversations:', error);
        const errorMessage = error.response ? error.response.data : 'Unknown error';
        res.status(500).send({ message: 'Error retrieving conversations', error: errorMessage });
    }
});

// Route to get messages for a specific conversation
app.get('/get-conversation-messages/:conversationId', async (req, res) => {
    const accessToken = 'EAAPZB0lL9wr8BOZB1QdqeD9EEis5NpZBNnqHIMBVHgXAnTgvZCjbycldTHq8OCHXNBKHVedHfSrMUblVIW45ZAbuhIBR1BEuhUzdz19PMl92HzBXJACzPmfGnQmcx7Lzf4xJZBdZAEjVTUgMAaMHgO4xpuafNibjYZAk0VcLycDtpwF3tlBRgzjIY0qWgZAZAkbBjZCt8ZBexakWzPqyb5qdQhXehm97'; // Use your access token

    const { conversationId } = req.params;

    try {
        // API call to retrieve messages for a conversation
        const response = await axios.get(`https://graph.facebook.com/v21.0/553379231532305/messages`, {
            params: {
                access_token: accessToken,
                //fields: 'message,from,created_time',
            },
        });

        // Send the message data as JSON
        res.json(response.data);
    } catch (error) {
        console.error(`Error retrieving messages for conversation ${conversationId}:`, error);
        const errorMessage = error.response ? error.response.data : 'Unknown error';
        res.status(500).send({ message: `Error retrieving messages for conversation ${conversationId}`, error: errorMessage });
    }
});

// Route to get dummy conversations data with AI labeling
app.get('/dummy-conversations', async (req, res) => {
    const dummyData = {
        conversations: [
            {
                provider: 'Facebook',
                id: '1',
                link: 'https://facebook.com/conversation/1',
                updated_time: '2023-10-01T12:00:00Z',
                messages: [
                    { from: 'User', message: 'I have a complaint about my order.', time: '2023-10-01T12:01:00Z' },
                ],
            },
            {
                provider: 'Facebook',
                id: '2',
                link: 'https://facebook.com/conversation/2',
                updated_time: '2023-10-02T12:00:00Z',
                label: 'Tech',
                messages: [
                    { from: 'User', message: 'The product I received is damaged.', time: '2023-10-02T12:01:00Z' },
                    { from: 'Support', message: 'We apologize for the inconvenience. We will send a replacement.', time: '2023-10-02T12:02:00Z' },
                ],
            },
            {
                provider: 'Instagram',
                id: '3',
                link: 'https://instagram.com/conversation/1',
                updated_time: '2023-10-03T12:00:00Z',
                label: 'Content Problems',
                messages: [
                    { from: 'User', message: 'I didn’t receive my package yet.', time: '2023-10-03T12:01:00Z' },
                    { from: 'Support', message: 'Let me check that for you.', time: '2023-10-03T12:02:00Z' },
                ],
            },
            {
                provider: 'Instagram',
                id: '4',
                link: 'https://instagram.com/conversation/2',
                updated_time: '2023-10-04T12:00:00Z',
                label: 'UX Problems',
                messages: [
                    { from: 'User', message: 'I want to return an item.', time: '2023-10-04T12:01:00Z' },
                    { from: 'Support', message: 'Please provide your order details.', time: '2023-10-04T12:02:00Z' },
                ],
            },
            {
                provider: 'WhatsApp',
                id: '5',
                link: 'https://whatsapp.com/conversation/1',
                updated_time: '2023-10-05T12:00:00Z',
                label: 'UI',
                messages: [
                    { from: 'User', message: 'I have an issue with my subscription.', time: '2023-10-05T12:01:00Z' },
                    { from: 'Support', message: 'I’m here to help. What seems to be the problem?', time: '2023-10-05T12:02:00Z' },
                ],
            },
            {
                provider: 'WhatsApp',
                id: '6',
                link: 'https://whatsapp.com/conversation/2',
                updated_time: '2023-10-06T12:00:00Z',
                label: 'Payment Problems',
                messages: [
                    { from: 'User', message: 'I was charged incorrectly.', time: '2023-10-06T12:01:00Z' },
                    { from: 'Support', message: 'I apologize for the error. Let’s resolve this.', time: '2023-10-06T12:02:00Z' },
                ],
            },
        ],
    };

    // Analyze each complaint and update labels
    for (const conversation of dummyData.conversations) {
        for (const message of conversation.messages) {
            if (message.from === 'User') {
                const label = await analyzeComplaint(message.message);
                conversation.label = label || 'Unlabeled'; // Default to 'Unlabeled' if no label is returned
            }
        }
    }

    // Send the dummy conversation data as JSON
    res.json(dummyData);
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log('Endpoints:');
    console.log(`- GET /get-messenger-conversations`);
    console.log(`- GET /get-conversation-messages/:conversationId`);
    console.log(`- GET /dummy-conversations`);
});
