# 🤖 AI Chatbot Setup Guide - Easy Alternatives

Your chatbot now supports **3 FREE AI providers**! Choose the easiest one for you:

---

## ⚡ Option 1: Groq (RECOMMENDED - Fastest & Easiest)

**Why Groq?**
- ✅ Completely FREE
- ✅ No credit card required
- ✅ Ultra-fast responses (faster than ChatGPT)
- ✅ Sign up with Google/GitHub (2 minutes)

**Setup Steps:**

1. **Get API Key:**
   - Visit: https://console.groq.com/keys
   - Click "Sign in" → Use Google or GitHub
   - Click "Create API Key"
   - Give it a name (e.g., "AgriChat")
   - Copy the API key

2. **Add to Your Project:**
   - Create a file named `.env` in the `frontend` folder
   - Add this line:
     ```
     VITE_GROQ_API_KEY=gsk_your_actual_api_key_here
     ```

3. **Restart Server:**
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

4. **Test It:**
   - Open your app
   - Click the chatbot
   - Ask: "What fertilizer for tomatoes?"
   - You should get an AI response! 🎉

---

## 🤗 Option 2: Hugging Face (100% Free, No Payment Ever)

**Why Hugging Face?**
- ✅ Completely FREE forever
- ✅ No credit card needed
- ✅ Great for learning

**Setup Steps:**

1. **Get API Token:**
   - Visit: https://huggingface.co/settings/tokens
   - Sign up (free, use email/Google/GitHub)
   - Click "New token"
   - Name: "AgriChatbot"
   - Role: "Read"
   - Copy the token

2. **Add to Your Project:**
   - Create `.env` file in `frontend` folder:
     ```
     VITE_HUGGINGFACE_API_KEY=hf_your_actual_token_here
     ```

3. **Restart & Test** (same as Option 1)

---

## 🎁 Option 3: OpenAI (Best Quality - $5 Free Credit)

**Why OpenAI?**
- ✅ Best quality responses
- ✅ $5 free credit for new users
- ✅ Uses GPT-3.5 (same as ChatGPT)

**Setup Steps:**

1. **Get API Key:**
   - Visit: https://platform.openai.com/api-keys
   - Sign up (requires phone verification)
   - Click "Create new secret key"
   - Copy the key (starts with `sk-`)

2. **Add to Your Project:**
   - Create `.env` file in `frontend` folder:
     ```
     VITE_OPENAI_API_KEY=sk-your_actual_key_here
     ```

3. **Restart & Test** (same as Option 1)

---

## 🔧 Troubleshooting

### "AI Service Not Configured" Error
- ✅ Make sure `.env` file is in the `frontend` folder (not root)
- ✅ Check there are NO spaces around the `=` sign
- ✅ Restart the development server after creating `.env`

### "Invalid API Key" Error
- ✅ Copy the ENTIRE key (including prefixes like `gsk_`, `hf_`, `sk-`)
- ✅ Make sure no quotes around the key in `.env`
- ✅ Check for extra spaces before/after the key

### Still Not Working?
1. Delete the `.env` file
2. Copy `.env.example` to `.env`
3. Replace `YOUR_API_KEY_HERE` with your actual key
4. Restart server

---

## 📝 Example `.env` File

```env
# Only add ONE of these (choose your preferred provider):

# For Groq (Recommended):
VITE_GROQ_API_KEY=gsk_abc123xyz789...

# OR for Hugging Face:
# VITE_HUGGINGFACE_API_KEY=hf_abc123xyz789...

# OR for OpenAI:
# VITE_OPENAI_API_KEY=sk-abc123xyz789...
```

---

## 🎯 Quick Comparison

| Provider | Speed | Quality | Setup Time | Cost |
|----------|-------|---------|------------|------|
| **Groq** | ⚡⚡⚡ Super Fast | ⭐⭐⭐⭐ Excellent | 2 min | FREE |
| Hugging Face | ⚡⚡ Good | ⭐⭐⭐ Good | 3 min | FREE |
| OpenAI | ⚡⚡ Good | ⭐⭐⭐⭐⭐ Best | 5 min | $5 free |

**Recommendation: Start with Groq!** 🚀

---

## ✅ Success Checklist

- [ ] Signed up for an AI provider
- [ ] Got API key/token
- [ ] Created `.env` file in `frontend` folder
- [ ] Added `VITE_XXXX_API_KEY=your_key` to `.env`
- [ ] Restarted development server
- [ ] Tested chatbot with a question
- [ ] Got AI response! 🎉

---

Need help? The chatbot will show you setup instructions if the API key is missing!
