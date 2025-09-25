# 🚀 GitHub Deployment Commands

After creating your GitHub repository, run these commands:

```bash
# Add the GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/ripstuff-web.git

# Push your code to GitHub
git branch -M main
git push -u origin main
```

Your code is now on GitHub! 🎉

## Next: Deploy with Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Choose "ripstuff-web" as the root directory
5. Add your environment variables (see PRODUCTION_CONFIG.md)
6. Deploy!

## Required Environment Variables for Vercel:

```env
DATABASE_URL=postgresql://neondb_owner:npg_IoB3RLkD4FvU@ep-muddy-art-adh26olr-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
GOOGLE_CLIENT_SECRET=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
MODERATOR_SECRET=your_secure_production_secret
BLOB_READ_WRITE_TOKEN=get_this_from_vercel_storage
OPENAI_API_KEY=your_openai_key_here
```

Your app will be live within minutes! 🌐