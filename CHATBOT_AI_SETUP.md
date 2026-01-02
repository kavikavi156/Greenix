# AI Chatbot Setup Guide 🤖

Your chatbot has been upgraded to use **Google's Gemini AI** - a powerful AI that works like ChatGPT!

## ✅ What's New?

The chatbot can now:
- Answer ANY question intelligently (not limited to predefined responses)
- Understand context and maintain conversation history
- Provide detailed agricultural advice
- Work like ChatGPT but specialized for agriculture
- Give product recommendations
- Answer questions about crops, fertilizers, pests, diseases, and more

## 🔑 Get Your Free Gemini API Key

1. **Visit Google AI Studio:**
   - Go to: https://makersuite.google.com/app/apikey
   - OR: https://aistudio.google.com/app/apikey

2. **Sign in with Google Account:**
   - Use any Google account (Gmail)

3. **Create API Key:**
   - Click "Create API Key"
   - Select "Create API key in new project" (or use existing project)
   - Copy the generated API key

4. **Update Your .env File:**
   - Open: `frontend/.env`
   - Replace the `VITE_GEMINI_API_KEY` value with your new API key:
   ```
   VITE_GEMINI_API_KEY=YOUR_NEW_API_KEY_HERE
   ```

5. **Restart Frontend Server:**
   - Stop the current server (Ctrl+C)
   - Run: `npm run dev` (from frontend folder)

## 💡 Features

### Intelligent Conversations
The bot now maintains conversation context and can:
- Remember previous messages in the conversation
- Provide follow-up answers
- Understand complex queries
- Give detailed explanations

### Agricultural Expertise
Specialized prompting makes it an expert in:
- Crop management
- Fertilizer recommendations
- Pest and disease diagnosis
- Soil management
- Weather-related advice
- Product recommendations

### Quick Actions
Pre-configured buttons for common questions:
- 🌱 Fertilizers
- 🐛 Pest Control  
- 🔍 Diseases
- 🛒 Products

### Voice Input
- Click the microphone to speak
- Supports English and Tamil
- Automatic transcription and response

## 🆓 Pricing

**Gemini AI is FREE** for:
- 60 requests per minute
- 1,500 requests per day
- More than enough for a small business website

## 🔄 Alternative: OpenAI (ChatGPT)

If you prefer to use OpenAI's ChatGPT API instead:

1. Get API key from: https://platform.openai.com/api-keys
2. Replace the `generateAIResponse` function in `ChatBot.jsx` with OpenAI's API
3. Note: OpenAI requires payment after free trial

## 🧪 Testing the Chatbot

Try these questions:
- "What fertilizer is best for tomatoes?"
- "How do I control aphids on my crops?"
- "My plant leaves are turning yellow, what should I do?"
- "What is NPK fertilizer?"
- "When should I apply urea?"
- "Best pesticides for rice crops"

## ⚠️ Important Notes

- **API Key Security:** Never commit your real API key to public repositories
- **Rate Limits:** Free tier has daily limits (1,500 requests/day)
- **Fallback:** If AI fails, the bot uses basic predefined responses
- **Context:** The bot remembers last 10 messages for better context

## 🔧 Troubleshooting

### Bot gives generic responses?
- Check if API key is correctly set in `.env`
- Verify frontend server was restarted after changing `.env`
- Check browser console for errors

### "API request failed" error?
- Verify API key is valid
- Check internet connection
- Ensure you haven't exceeded rate limits

### Responses are slow?
- Normal - AI processing takes 1-3 seconds
- Check your internet speed

## 📝 Customization

To modify the bot's personality or expertise:

Edit the `context` prompt in `ChatBot.jsx` (line ~107):
```javascript
const context = `You are an expert agricultural assistant...`
```

Change this to customize:
- Tone and personality
- Specific expertise areas
- Response format
- Language style

## 🎯 Best Practices

1. **Be Specific:** Ask detailed questions for better answers
2. **Provide Context:** Mention crop type, location, symptoms
3. **Follow-up:** Ask clarifying questions
4. **Use Voice:** Great for hands-free operation in the field

Enjoy your intelligent AI-powered chatbot! 🚀
