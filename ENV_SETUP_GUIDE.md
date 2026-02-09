# Environment Setup Guide

## Required Environment Variables

The chatbot requires three OpenRouter API keys for fallback support. Add these to your `.env` file:

```bash
# OpenRouter API Keys (used sequentially for fallback)
EXPO_PUBLIC_OPEN_ROUTER_API_KEY1=sk-or-v1-your-first-key-here
EXPO_PUBLIC_OPEN_ROUTER_API_KEY2=sk-or-v1-your-second-key-here
EXPO_PUBLIC_OPEN_ROUTER_API_KEY3=sk-or-v1-your-third-key-here
```

## Getting OpenRouter API Keys

1. Visit [OpenRouter.ai](https://openrouter.ai/)
2. Sign up or log in
3. Navigate to API Keys section
4. Generate new API keys
5. Copy each key to your `.env` file

## Why Three Keys?

The implementation uses three API keys for robust fallback support:

1. **Primary Key (KEY1)**: Used for all initial requests
2. **Secondary Key (KEY2)**: Used if KEY1 fails or hits rate limits
3. **Tertiary Key (KEY3)**: Used if both KEY1 and KEY2 fail

This ensures maximum uptime and reliability for the chatbot.

## Fallback Hierarchy

```
User Message
    ↓
Try KEY1 with Model 1
    ↓ (if fails)
Try KEY1 with Model 2
    ↓ (if fails)
Try KEY1 with Model 3
    ↓ (if fails)
Try KEY1 with Model 4
    ↓ (if all models fail with KEY1)
Try KEY2 with Model 1
    ↓ (if fails)
Try KEY2 with Model 2
    ↓ (if fails)
Try KEY2 with Model 3
    ↓ (if fails)
Try KEY2 with Model 4
    ↓ (if all models fail with KEY2)
Try KEY3 with Model 1
    ↓ (if fails)
Try KEY3 with Model 2
    ↓ (if fails)
Try KEY3 with Model 3
    ↓ (if fails)
Try KEY3 with Model 4
    ↓ (if all fail)
Fallback to Rule-Based Responses
```

## Models Used (in order)

1. `google/gemini-2.0-flash-exp:free`
2. `meta-llama/llama-3.2-3b-instruct:free`
3. `qwen/qwen-2-7b-instruct:free`
4. `microsoft/phi-3-mini-128k-instruct:free`

All models are free-tier models from OpenRouter.

## Testing Configuration

### Minimal Setup (1 Key)
For testing, you can use just one key:
```bash
EXPO_PUBLIC_OPEN_ROUTER_API_KEY1=sk-or-v1-your-key-here
```

The chatbot will still work but with reduced fallback capability.

### Recommended Setup (3 Keys)
For production, use all three keys:
```bash
EXPO_PUBLIC_OPEN_ROUTER_API_KEY1=sk-or-v1-key-1
EXPO_PUBLIC_OPEN_ROUTER_API_KEY2=sk-or-v1-key-2
EXPO_PUBLIC_OPEN_ROUTER_API_KEY3=sk-or-v1-key-3
```

### No Keys (Fallback Mode)
If no keys are set, the chatbot automatically falls back to rule-based responses using `chatbot-rules.json` and still provides live data summaries.

## Verifying Setup

### Check Environment Variables
```bash
# In your project directory
cat .env | grep EXPO_PUBLIC_OPEN_ROUTER
```

### Test in App
1. Start the app: `npx expo start`
2. Navigate to Chatbot screen
3. Send a message
4. Check console logs for:
   - `🔑 Trying API key 1/3` (or 1/2, 1/1 depending on setup)
   - `🔄 Trying model X/4`
   - `✅ Success with key X, model: ...`

### Console Log Examples

**Success with first key:**
```
🔑 Trying API key 1/3
🔄 Trying model 1/4: mistralai/mistral-7b-instruct:free
🔍 OpenRouter API call (key 1, model: mistralai/mistral-7b-instruct:free, attempt 1)
✅ Success with key 1, model: mistralai/mistral-7b-instruct:free
```

**Fallback to second key:**
```
🔑 Trying API key 1/3
🔄 Trying model 1/4: mistralai/mistral-7b-instruct:free
❌ API Error 401: Invalid API key
🔑 Trying API key 2/3
🔄 Trying model 1/4: mistralai/mistral-7b-instruct:free
✅ Success with key 2, model: mistralai/mistral-7b-instruct:free
```

**Complete fallback to rules:**
```
🔑 Trying API key 1/3
❌ All models failed with key 1, trying next key...
🔑 Trying API key 2/3
❌ All models failed with key 2, trying next key...
🔑 Trying API key 3/3
❌ All models failed with key 3, trying next key...
❌ All OpenRouter API keys and models failed, falling back to rule-based responses
```

## Troubleshooting

### Issue: "No OpenRouter API keys are set"
**Solution:** Add at least one API key to `.env` file

### Issue: "Authentication error 401"
**Solution:** Verify API key is correct and active on OpenRouter

### Issue: "Rate limit exceeded 429"
**Solution:** This is expected - the system will automatically retry with exponential backoff and try the next key if needed

### Issue: Chatbot always uses fallback responses
**Solution:** 
1. Check API keys are valid
2. Check internet connection
3. Verify OpenRouter service status
4. Check console logs for specific error messages

### Issue: Responses are slow
**Solution:**
1. This is normal - the system tries multiple models/keys
2. First successful response is used
3. Consider using paid OpenRouter models for faster responses

## Best Practices

1. **Use Different Keys**: Don't use the same key three times - use three different keys for true fallback
2. **Monitor Usage**: Check OpenRouter dashboard for API usage and limits
3. **Rotate Keys**: Periodically rotate keys for security
4. **Keep Keys Secret**: Never commit `.env` file to version control
5. **Test Fallback**: Occasionally test with invalid keys to ensure fallback works

## Security Notes

- API keys are loaded from environment variables (secure)
- Keys are never exposed in client code
- Keys are never logged to console
- Keys are only sent to OpenRouter API (HTTPS)
- No keys are stored in AsyncStorage or local storage

## Cost Considerations

- All models used are **free-tier** models
- No cost for API calls to these models
- OpenRouter may have rate limits on free tier
- Consider upgrading to paid models for:
  - Higher rate limits
  - Faster responses
  - Better quality responses
  - Priority access

## Additional Configuration

### Turso Database (Already Configured)
```bash
EXPO_PUBLIC_TURSO_DATABASE_URL=your-turso-url
EXPO_PUBLIC_TURSO_AUTH_TOKEN=your-turso-token
```

These are required for the chatbot to fetch live data from the database.

## Complete .env Example

```bash
# Turso Database
EXPO_PUBLIC_TURSO_DATABASE_URL=libsql://your-db.turso.io
EXPO_PUBLIC_TURSO_AUTH_TOKEN=your-turso-token

# OpenRouter API Keys
EXPO_PUBLIC_OPEN_ROUTER_API_KEY1=sk-or-v1-key-1
EXPO_PUBLIC_OPEN_ROUTER_API_KEY2=sk-or-v1-key-2
EXPO_PUBLIC_OPEN_ROUTER_API_KEY3=sk-or-v1-key-3
```

## Next Steps

1. ✅ Add API keys to `.env`
2. ✅ Restart Expo development server
3. ✅ Test chatbot functionality
4. ✅ Monitor console logs
5. ✅ Verify live data integration
6. ✅ Test fallback scenarios
7. ✅ Deploy to production
