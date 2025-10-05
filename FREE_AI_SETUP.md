# 🆓 Free AI Setup for PDF Transaction Extraction

## 🥇 Option 1: Hugging Face (100% FREE - Recommended)
**Cost**: Completely Free Forever
**Quality**: ⭐⭐⭐ Good
**Best for**: No budget, unlimited usage

### Setup:
1. Go to [Hugging Face Settings](https://huggingface.co/settings/tokens)
2. Create a free account
3. Generate a new token (select "Read" permissions)
4. Add to your `.env.local`:
```bash
HUGGINGFACE_API_KEY=hf_your-token-here
```

## 🥈 Option 2: Groq (Free Tier)
**Cost**: Free tier with generous limits
**Quality**: ⭐⭐⭐⭐ Very Good
**Best for**: High quality, some usage limits

### Setup:
1. Go to [Groq Console](https://console.groq.com/keys)
2. Create an account and get your API key
3. Add to your `.env.local`:
```bash
GROQ_API_KEY=gsk_your-key-here
```

## 🥉 Option 3: OpenAI API (Paid but Cheap)
**Cost**: $5 free credit monthly, then pay-per-use
**Quality**: ⭐⭐⭐⭐⭐ Excellent
**Best for**: Highest quality, willing to pay

### Setup:
1. Go to [OpenAI API](https://platform.openai.com/api-keys)
2. Create an account and get your API key
3. Add to your `.env.local`:
```bash
OPENAI_API_KEY=sk-your-key-here
```

## 🎯 How It Works:
The system tries AI services in this order:
1. **Hugging Face** (100% Free) - First choice
2. **OpenAI** (if Hugging Face fails and you have a key)
3. **Groq** (if others fail and you have a key)
4. **Regex parsing** (if all AI services fail)

## ⚡ Quick Start (Recommended):
1. **Get Hugging Face token** (completely free)
2. **Add to `.env.local`**: `HUGGINGFACE_API_KEY=hf_your-token-here`
3. **Restart dev server**
4. **Upload PDF** - will use free AI!

## 🔧 Complete `.env.local` Example:
```bash
# Primary: Hugging Face (100% Free)
HUGGINGFACE_API_KEY=hf_your-token-here

# Optional: OpenAI (if you want higher quality)
OPENAI_API_KEY=sk-your-key-here

# Optional: Groq (if you want backup)
GROQ_API_KEY=gsk_your-key-here
```

## 🚀 Benefits:
- **Hugging Face**: 100% free, unlimited usage
- **Smart fallback**: Tries multiple services automatically
- **No cost**: Works completely free with Hugging Face
- **High quality**: AI properly categorizes transactions
- **Reliable**: Falls back to regex if AI fails

## 🛠️ Troubleshooting:
- If all AI services fail, it falls back to regex parsing
- Check your API key is correct
- Make sure you have internet connection
- Hugging Face has rate limits but they're very generous
