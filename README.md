# 🪦 RipStuff Web - Virtual Memorial Platform

A Next.js application for creating digital memorials and managing virtual graveyards. Users can create memorials for cherished items, share stories, and explore an interactive cemetery map.

![Virtual Graveyard](https://img.shields.io/badge/Status-Live-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
![Prisma](https://img.shields.io/badge/Prisma-PostgreSQL-blue)

## ✨ Features

- 🏛️ **Virtual Cemetery**: Interactive map with biome-based environments
- 📝 **AI-Powered Eulogies**: Generate heartfelt memorials using AI
- 🖼️ **Media Support**: Upload photos and videos for memorials
- 👥 **Social Features**: Reactions, sympathies, and community interaction
- 🛡️ **Moderation Tools**: Content management and reporting system
- 📱 **Responsive Design**: Works beautifully on all devices
- 🔐 **OAuth Authentication**: Google sign-in integration
- 📊 **Analytics Ready**: Built-in tracking and metrics

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended package manager)
- PostgreSQL database (we use Neon)
- OpenAI API key or compatible service (Ollama, Groq, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ripstuff-web.git
   cd ripstuff-web
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   pnpm approve-builds
   pnpm config set allowed-build-scripts "@prisma/client @prisma/engines prisma @tailwindcss/oxide sharp unrs-resolver"
   ```

3. **Set up environment variables**
   ```bash
   cd ripstuff-web
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Configure your database**
   ```bash
   pnpm --filter ripstuff-web prisma:migrate
   ```

5. **Start development server**
   ```bash
   pnpm --filter ripstuff-web dev
   ```

Visit `http://localhost:3000` to see your application running!

## 🏗️ Project Structure

```
virtual_graveyard/
├── ripstuff-web/           # Main Next.js application
│   ├── src/
│   │   ├── app/           # Next.js 14 App Router
│   │   ├── components/    # React components
│   │   ├── lib/          # Utilities and helpers
│   │   └── types/        # TypeScript type definitions
│   ├── prisma/           # Database schema and migrations
│   ├── public/           # Static assets
│   └── docs/            # Documentation
├── scripts/              # Utility scripts
└── docs/                # Project documentation
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Connect to GitHub**
   - Push your code to GitHub
   - Connect your repository to Vercel

2. **Set Environment Variables**
   ```bash
   DATABASE_URL=postgresql://your_database_url
   GOOGLE_CLIENT_SECRET=your_google_oauth_secret
   BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
   OPENAI_API_KEY=your_openai_key
   MODERATOR_SECRET=your_secure_moderator_password
   ```

3. **Deploy**
   - Vercel will automatically deploy on every push to main
   - Check the deployment status in your Vercel dashboard

### Alternative Deployments

- **Railway**: Full-stack deployment with built-in PostgreSQL
- **DigitalOcean App Platform**: Competitive pricing and scaling
- **Netlify**: Great for static site generation

## ⚙️ Configuration

### AI Services

The app supports multiple AI providers:

- **OpenAI**: Production-ready, reliable (requires API key)
- **Ollama**: Local AI, free (run `ollama serve` locally)
- **Groq**: Fast inference, free tier available
- **OpenRouter**: Access to multiple models

### File Uploads

Choose your preferred upload strategy:

- **Vercel Blob**: Seamless integration (recommended)
- **AWS S3**: Enterprise-grade storage
- **Local**: Development only

### Database

Supports PostgreSQL with Prisma ORM:
- **Neon**: Serverless PostgreSQL (recommended)
- **Supabase**: Open source alternative
- **Railway**: Built-in PostgreSQL
- **Self-hosted**: Any PostgreSQL instance

## 🛠️ Development

### Common Commands

```bash
# Development
pnpm --filter ripstuff-web dev

# Build for production
pnpm --filter ripstuff-web build

# Database operations
pnpm --filter ripstuff-web prisma:migrate
pnpm --filter ripstuff-web prisma:studio

# Linting and formatting
pnpm --filter ripstuff-web lint
```

### Environment Setup

Create `ripstuff-web/.env.local`:

```env
# Database
DATABASE_URL=postgresql://your_database_url

# OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# AI (choose one)
OPENAI_API_KEY=your_openai_key
# OR for local development:
# OPENAI_BASE_URL=http://localhost:11434/v1
# OPENAI_API_KEY=ollama
# EULOGY_MODEL=qwen2.5:7b-instruct

# File Uploads
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token

# Admin
MODERATOR_SECRET=your_secure_password
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📚 [Documentation](./docs/)
- 🐛 [Report Issues](https://github.com/yourusername/ripstuff-web/issues)
- 💬 [Discussions](https://github.com/yourusername/ripstuff-web/discussions)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database powered by [Prisma](https://prisma.io/)
- UI components with [Tailwind CSS](https://tailwindcss.com/)
- Deployed on [Vercel](https://vercel.com/)

---

**Remember**: This platform helps people create meaningful digital memorials. Handle user content with care and respect. 💙