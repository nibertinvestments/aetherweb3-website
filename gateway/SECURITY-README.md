# Environment Security Guidelines

## ⚠️ CRITICAL SECURITY INFORMATION ⚠️

### File Types:
- **`.env`** - Contains REAL secrets (NEVER commit to Git)
- **`.env.example`** - Template with placeholder values (safe to commit)

### Security Rules:

1. **NEVER commit `.env` files to version control**
2. **NEVER share your `.env` file contents**
3. **NEVER put real values in `.env.example`**
4. **ALWAYS use `.env.example` as a template only**

### Setup Process:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your real values:
   - Replace `your_actual_value_here` with real API keys
   - Never share this file

3. For deployment:
   - Use environment variables or secure secret management
   - Never deploy using `.env.example`

### What Goes Where:

**`.env`** (PRIVATE - real values):
```
STRIPE_SECRET_KEY=sk_live_51Rz6RyL16dRIvW3a...
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
```

**`.env.example`** (PUBLIC - placeholders):
```
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

### Git Protection:

The `.gitignore` file ensures `.env` is never committed:
```
# Environment variables - NEVER commit these!
.env
.env.local
.env.production
```

### If You Accidentally Commit Secrets:

1. **Immediately rotate all exposed keys**
2. **Remove from Git history** (not just delete the file)
3. **Update all services with new keys**

## Remember: Security is not optional!