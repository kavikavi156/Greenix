import React, { useState, useEffect, useRef } from 'react';
import '../css/ChatBot.css';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    
    // Load chat history from localStorage
    const loadChatHistory = () => {
        try {
            const savedMessages = localStorage.getItem('chatbot_messages');
            if (savedMessages) {
                const parsed = JSON.parse(savedMessages);
                // Convert timestamp strings back to Date objects
                return parsed.map(msg => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                }));
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
        // Default welcome message
        return [
            {
                id: 1,
                type: 'bot',
                text: `Hello! 👋 I'm your AI Agricultural Assistant powered by advanced AI technology.

I can help you with:
• Crop management and cultivation advice
• Fertilizer and pesticide recommendations
• Disease and pest identification & treatment
• Soil health and water management
• Seasonal farming guidance
• Product recommendations from our store

Ask me anything about agriculture - I'm here to help! 🌱`,
                timestamp: new Date()
            }
        ];
    };

    const [messages, setMessages] = useState(loadChatHistory());
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [language, setLanguage] = useState('en-US');
    const [isListening, setIsListening] = useState(false);
    const [conversationHistory, setConversationHistory] = useState([]);

    const recognition = useRef(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognition.current = new SpeechRecognition();
            recognition.current.continuous = false;
            recognition.current.lang = language;
            recognition.current.interimResults = true;

            recognition.current.onstart = () => setIsListening(true);
            recognition.current.onend = () => setIsListening(false);

            recognition.current.onresult = (event) => {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    transcript += event.results[i][0].transcript;
                }
                setInputValue(transcript);
                if (event.results[0].isFinal) {
                    setTimeout(() => handleSendMessage(null, transcript), 800);
                }
            };

            recognition.current.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };
        }
    }, [language]);

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen) setTimeout(() => inputRef.current?.focus(), 300);
    };

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en-US' ? 'ta-IN' : 'en-US');
    };

    const clearChatHistory = () => {
        if (window.confirm('Are you sure you want to clear all chat history?')) {
            const defaultWelcomeMessage = {
                id: Date.now(),
                type: 'bot',
                text: "👋 Vanakkam! I'm your Agri Expert AI assistant. I can help you with:\n\n• Fertilizer recommendations\n• Pest control advice\n• Crop disease identification\n• Product recommendations\n• General farming tips\n\nAsk me anything!",
                timestamp: new Date()
            };
            setMessages([defaultWelcomeMessage]);
            localStorage.removeItem('chatbot_messages');
        }
    };

    const startListening = () => {
        if (recognition.current) {
            if (isListening) recognition.current.stop();
            else recognition.current.start();
        } else {
            alert("Voice input not supported in this browser.");
        }
    };

    const speak = (text) => {
        window.speechSynthesis.cancel();
        // Clean text: remove markdown (*, #) and emojis to speak clearly
        const cleanText = text.replace(/[*#\–]/g, '').replace(/[\u{1F600}-\u{1F6FF}]/gu, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = language;
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => { scrollToBottom(); }, [messages, isTyping, isOpen]);

    // Save chat history to localStorage whenever messages change
    useEffect(() => {
        try {
            localStorage.setItem('chatbot_messages', JSON.stringify(messages));
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    }, [messages]);

    // Multi-Provider AI Response Generator
    const generateAIResponse = async (userMessage) => {
        // Check for available API keys (priority order)
        const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
        const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
        const HUGGINGFACE_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;
        
        // Debug: Log API key status (first 10 chars only for security)
        console.log('API Key Check:', {
            openai: OPENAI_API_KEY ? `${OPENAI_API_KEY.substring(0, 10)}...` : 'Not found',
            groq: GROQ_API_KEY ? 'Available' : 'Not found',
            huggingface: HUGGINGFACE_API_KEY ? 'Available' : 'Not found'
        });
        
        // Check if any API key is available
        if ((!GROQ_API_KEY || GROQ_API_KEY === 'YOUR_API_KEY_HERE') && 
            (!OPENAI_API_KEY || OPENAI_API_KEY === 'YOUR_API_KEY_HERE') &&
            (!HUGGINGFACE_API_KEY || HUGGINGFACE_API_KEY === 'YOUR_API_KEY_HERE')) {
            return `⚠️ **AI Service Not Configured**

To use the AI-powered chatbot, set up one of these FREE API keys:

**Option 1: Groq (Recommended - Fastest & Free)**
1. Visit: https://console.groq.com/keys
2. Sign up with Google/GitHub
3. Create API key
4. Add to .env: \`VITE_GROQ_API_KEY=your_key\`

**Option 2: Hugging Face (Free)**
1. Visit: https://huggingface.co/settings/tokens
2. Sign up (free)
3. Create new token
4. Add to .env: \`VITE_HUGGINGFACE_API_KEY=your_key\`

**Option 3: OpenAI ($5 free credit)**
1. Visit: https://platform.openai.com/api-keys
2. Sign up (requires phone)
3. Get $5 free credit
4. Add to .env: \`VITE_OPENAI_API_KEY=your_key\`

Then restart the development server!`;
        }

        try {
            // Build conversation context
            const conversationContext = conversationHistory.length > 0
                ? conversationHistory.map(msg => 
                    `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
                  ).join('\n') + '\n'
                : '';

            // System prompt for agricultural assistant
            const systemPrompt = `You are an expert AI Agricultural Assistant named "Agri Expert" working for Pavithra Traders, a leading agricultural products company.

Your expertise includes:
- Crop cultivation, management, and disease control
- Fertilizer recommendations (NPK ratios, organic options)
- Pesticide selection and safe usage
- Soil testing, pH management, and amendments
- Irrigation systems and water management
- Pest and disease identification with treatments
- Seasonal farming calendar and best practices
- Organic farming methods
- Climate-appropriate crop selection
- Harvest and post-harvest management

Response Guidelines:
1. Be conversational, helpful, and encouraging like ChatGPT
2. Provide specific, actionable advice with clear steps
3. Use emojis sparingly for friendliness (🌱 🌾 💧 ☀️)
4. Give practical recommendations based on common agricultural practices
5. When relevant, mention that Pavithra Traders offers quality agricultural products
6. If asked about specific products, suggest checking our product catalog
7. For complex issues, provide detailed solutions with alternatives
8. Be concise but thorough - aim for helpful responses, not essays
9. If you don't know something, be honest and suggest consulting a local agricultural expert
10. Remember context from previous messages in the conversation

Context from previous conversation:
${conversationContext}

Current user question: ${userMessage}

Provide a helpful, expert response:`;

            let response, data, aiResponse;

            // Try Groq first (fastest and free)
            if (GROQ_API_KEY && GROQ_API_KEY !== 'YOUR_API_KEY_HERE') {
                console.log('Trying Groq API...');
                try {
                    response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${GROQ_API_KEY}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            model: 'llama-3.3-70b-versatile',
                            messages: [
                                { 
                                    role: 'user', 
                                    content: `You are an expert AI Agricultural Assistant for Pavithra Traders. Provide helpful, practical farming advice for this question: ${userMessage}` 
                                }
                            ],
                            temperature: 0.7,
                            max_tokens: 1024,
                        })
                    });

                    console.log('Groq Response Status:', response.status);

                    if (response.ok) {
                        data = await response.json();
                        aiResponse = data.choices?.[0]?.message?.content;
                        console.log('Groq Response received:', aiResponse ? 'Success' : 'Empty');
                    } else {
                        const errorData = await response.json().catch(() => ({}));
                        console.error('Groq API Error:', response.status, errorData);
                        console.error('Groq Error Details:', JSON.stringify(errorData, null, 2));
                    }
                } catch (groqError) {
                    console.error('Groq Error:', groqError);
                }
            }
            
            // Try OpenAI if Groq fails or not available
            if (!aiResponse && OPENAI_API_KEY && OPENAI_API_KEY !== 'YOUR_API_KEY_HERE') {
                console.log('Trying OpenAI API...');
                try {
                    response = await fetch('https://api.openai.com/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${OPENAI_API_KEY}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            model: 'gpt-3.5-turbo',
                            messages: [
                                { role: 'system', content: systemPrompt.split('Current user question:')[0] },
                                { role: 'user', content: userMessage }
                            ],
                            temperature: 0.8,
                            max_tokens: 2048,
                        })
                    });

                    console.log('OpenAI Response Status:', response.status);
                    
                    if (response.ok) {
                        data = await response.json();
                        aiResponse = data.choices?.[0]?.message?.content;
                        console.log('OpenAI Response received:', aiResponse ? 'Success' : 'Empty');
                    } else {
                        const errorData = await response.json().catch(() => ({}));
                        console.error('OpenAI API Error:', response.status, errorData);
                        
                        // Handle specific OpenAI errors
                        if (response.status === 401) {
                            return `❌ **Invalid OpenAI API Key**

Your API key appears to be invalid or expired.

**Steps to fix:**
1. Go to: https://platform.openai.com/api-keys
2. Create a new API key
3. Update your .env file with the new key
4. Restart the dev server

Current key starts with: ${OPENAI_API_KEY.substring(0, 15)}...`;
                        } else if (response.status === 429) {
                            return `⚠️ **OpenAI Quota/Billing Issue**

Error 429 usually means one of these:

**Most Common Issue - Billing Not Set Up:**
1. Go to: https://platform.openai.com/account/billing/overview
2. Add a payment method (required even for free tier)
3. Add at least $5 credit to your account
4. Wait 5-10 minutes for it to activate

**OR Rate Limit Exceeded:**
- You've made too many requests
- Wait a few minutes and try again
- Free tier has strict rate limits

**Alternative:** Use Groq instead (100% free, no billing):
1. Get key from: https://console.groq.com/keys
2. Add to .env: VITE_GROQ_API_KEY=your_key
3. Restart server

Check your OpenAI dashboard for details.`;
                        } else if (response.status === 403) {
                            return `❌ **API Access Denied**

Your API key doesn't have permission to use this service.

**Common causes:**
- Billing not set up on OpenAI account
- API key restrictions
- Account limitations

**Fix:**
1. Visit: https://platform.openai.com/account/billing
2. Set up a payment method
3. Add credits to your account

**Or use free alternative - Groq:**
Get key from: https://console.groq.com/keys`;
                        }
                    }
                } catch (openaiError) {
                    console.error('OpenAI Error:', openaiError);
                    if (openaiError.message && openaiError.message.startsWith('❌')) {
                        return openaiError.message; // Return formatted error messages
                    }
                    // Continue to try other providers if it's a network error
                }
            }

            // Try Hugging Face if others fail
            if (!aiResponse && HUGGINGFACE_API_KEY && HUGGINGFACE_API_KEY !== 'YOUR_API_KEY_HERE') {
                response = await fetch('https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        inputs: `${systemPrompt}\n\nUser: ${userMessage}\nAssistant:`,
                        parameters: {
                            max_new_tokens: 1024,
                            temperature: 0.8,
                            return_full_text: false
                        }
                    })
                });

                if (response.ok) {
                    data = await response.json();
                    aiResponse = data[0]?.generated_text || data.generated_text;
                }
            }

            if (!aiResponse) {
                throw new Error('No response generated from AI services');
            }

            // Update conversation history
            setConversationHistory(prev => [
                ...prev,
                { role: 'user', content: userMessage },
                { role: 'assistant', content: aiResponse }
            ].slice(-20));

            return aiResponse;

        } catch (error) {
            console.error('AI Response Error:', error);
            
            if (error.message.includes('401') || error.message.includes('invalid')) {
                return `❌ **Invalid API Key**

Your API key appears to be invalid. Please:
1. Check your .env file
2. Verify the API key from the provider's dashboard
3. Make sure you copied it correctly (no extra spaces)
4. Restart the development server

Error: ${error.message}`;
            }
            
            if (error.message.includes('429')) {
                return `⏸️ **Rate Limit Reached**

You've reached the API rate limit. Please:
• Wait a few moments and try again
• Consider upgrading your plan
• Try a different API provider

Error: ${error.message}`;
            }

            return `❌ **Connection Error**

I'm having trouble connecting to the AI service:
• Check your internet connection
• Verify your API key is correct
• The AI service might be temporarily unavailable

Error: ${error.message}

Please try again in a moment.`;
        }
    };

    const handleSendMessage = async (e, overrideText = null) => {
        if (e) e.preventDefault();
        const textToSend = overrideText !== null ? overrideText : inputValue;
        if (!textToSend || !textToSend.trim()) return;

        const userMessage = {
            id: messages.length + 1,
            type: 'user',
            text: textToSend,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        try {
            // Get AI response
            const responseText = await generateAIResponse(textToSend);
            
            const botMessage = {
                id: messages.length + 2,
                type: 'bot',
                text: responseText,
                timestamp: new Date()
            };
            
            setMessages(prev => [...prev, botMessage]);
            speak(responseText);
        } catch (error) {
            console.error('Error generating response:', error);
            const errorMessage = {
                id: messages.length + 2,
                type: 'bot',
                text: "I apologize, but I'm experiencing technical difficulties. Please try again.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleQuickAction = (action) => {
        setInputValue(action);
    };

    const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <>
            <button
                className={`chatbot-fab ${isOpen ? 'active' : ''}`}
                onClick={toggleChat}
                aria-label="Toggle Chat"
            >
                {isOpen ? (
                    <svg className="chatbot-fab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6L18 18" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                ) : (
                    <svg className="chatbot-fab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 11.5C21.0031 12.8199 20.6951 14.1272 20.103 15.3128C19.5108 16.4984 18.6524 17.5255 17.6033 18.3031C16.5542 19.0807 15.347 19.5855 14.088 19.7725C12.8291 19.9595 11.5553 19.8229 10.3777 19.375L3 21L4.625 13.6223C4.17712 12.4447 4.04052 11.1709 4.22749 9.91196C4.41446 8.65304 4.91925 7.44577 5.69689 6.39672C6.47453 5.34767 7.5016 4.48924 8.68722 3.89708C9.87284 3.30492 11.1801 2.99692 12.5 3.00004H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </button>

            <div className={`chatbot-window ${isOpen ? 'visible' : 'hidden'}`}>
                <div className="chatbot-header">
                    <div className="chatbot-title-area">
                        <div className="chatbot-avatar">👨‍🌾</div>
                        <div className="chatbot-info">
                            <h3>Agri Expert AI</h3>
                            <p><span className="status-dot"></span> Online - AI Powered</p>
                        </div>
                    </div>
                    <button className="language-toggle" onClick={toggleLanguage} title="Switch Language">
                        {language === 'en-US' ? '🇺🇸 ENG' : '🇮🇳 தமிழ்'}
                    </button>
                    <button className="language-toggle" onClick={clearChatHistory} title="Clear Chat History" style={{marginLeft: '8px'}}>
                        🗑️
                    </button>
                    <button className="chatbot-close-btn" onClick={toggleChat}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6L18 18" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>

                <div className="chatbot-messages">
                    <div className="chat-date">{new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</div>
                    {messages.map((msg) => (
                        <div key={msg.id} className={`message ${msg.type}`}>
                            {msg.text.split('\n').map((line, i) => (
                                <React.Fragment key={i}>
                                    {line}
                                    {i < msg.text.split('\n').length - 1 && <br />}
                                </React.Fragment>
                            ))}
                            <span className="message-time">{formatTime(msg.timestamp)}</span>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="typing-indicator">
                            <span className="typing-dot"></span><span className="typing-dot"></span><span className="typing-dot"></span>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="quick-actions">
                    <button className="quick-action-btn" onClick={() => handleQuickAction('What fertilizers do you recommend?')}>🌱 Fertilizers</button>
                    <button className="quick-action-btn" onClick={() => handleQuickAction('How to control pests?')}>🐛 Pest Control</button>
                    <button className="quick-action-btn" onClick={() => handleQuickAction('Crop disease symptoms')}>🔍 Diseases</button>
                    <button className="quick-action-btn" onClick={() => handleQuickAction('Show products')}>🛒 Products</button>
                </div>

                <form className="chatbot-input-area" onSubmit={(e) => handleSendMessage(e)}>
                    <button
                        type="button"
                        className={`mic-btn ${isListening ? 'listening' : ''}`}
                        onClick={startListening}
                        title={isListening ? "Listening..." : "Speak"}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.66 9 5v6c0 1.66 1.34 3 3 3z" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M19 10v1c0 3.31-2.69 6-6 6s-6-2.69-6-6v-1" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M12 21v-4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <input
                        ref={inputRef}
                        type="text"
                        className="chatbot-input"
                        placeholder={isListening ? (language === 'ta-IN' ? "கேட்கிறது..." : "Listening...") : (language === 'ta-IN' ? "கேளுங்கள்..." : "Ask me anything about agriculture...")}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                    <button type="submit" className="chatbot-send-btn" disabled={!inputValue.trim()}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </form>
            </div>
        </>
    );
};

export default ChatBot;
