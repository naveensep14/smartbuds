# 🆓 Free AI Setup Guide

## Google Gemini (Recommended - Free Tier)

### Step 1: Get Free API Key
1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key

### Step 2: Add to Environment
Add this to your `.env.local` file:
```
GEMINI_API_KEY=your_api_key_here
```

### Step 3: Test the Setup
Run this command to test:
```bash
python3 pdf_processor_gemini.py tmp/cemm101.pdf Mathematics "3rd Grade" CBSE
```

## Alternative Free Options

### 1. Anthropic Claude (Free Tier)
- **Free**: $5 credit monthly
- **Get key**: https://console.anthropic.com/
- **Add to .env.local**: `ANTHROPIC_API_KEY=your_key`

### 2. Hugging Face (Free Tier)
- **Free**: Limited requests
- **Get key**: https://huggingface.co/settings/tokens
- **Add to .env.local**: `HUGGINGFACE_API_KEY=your_key`

### 3. Ollama (Local - Completely Free)
- **Install**: `brew install ollama`
- **Start**: `ollama serve`
- **Pull model**: `ollama pull llama2`
- **No API key needed** - runs locally

## Current Setup
The system now uses **Google Gemini** by default (free tier).
If you want to use a different AI service, just update the API route to use the corresponding Python script.

## Benefits of Free AI
✅ **No monthly costs**
✅ **High-quality questions**
✅ **Based on PDF content**
✅ **Educational accuracy**
✅ **10 questions per test**
