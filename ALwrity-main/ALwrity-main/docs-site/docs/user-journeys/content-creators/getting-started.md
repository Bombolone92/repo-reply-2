# Getting Started - Content Creators

Welcome! This guide will get you up and running with ALwrity in just 30 minutes. ALwrity is a self-hosted, open-source AI content creation platform that you run on your own computer.

## 🎯 What You'll Accomplish

By the end of this guide, you'll have:
- ✅ ALwrity running on your local machine
- ✅ Configured API keys for AI services
- ✅ Completed the onboarding process
- ✅ Created your first content piece
- ✅ Published or scheduled your content

## ⏱️ Time Required: 30 minutes

## 🚀 Step-by-Step Setup

### Step 1: Prerequisites Check (5 minutes)

Before we start, ensure you have the following installed:

#### Required Software
- **Python 3.8+**: [Download Python](https://www.python.org/downloads/)
- **Node.js 18+**: [Download Node.js](https://nodejs.org/)
- **Git**: [Download Git](https://git-scm.com/downloads)

#### Verify Installation
Open your terminal/command prompt and run:

```bash
# Check Python version
python --version
# Should show Python 3.8 or higher

# Check Node.js version
node --version
# Should show v18 or higher

# Check Git
git --version
# Should show Git version
```

### Step 2: Download ALwrity (5 minutes)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/AJaySi/ALwrity.git
   cd ALwrity
   ```

2. **Verify the download**:
   You should see folders: `backend`, `frontend`, `docs`, etc.

### Step 3: Backend Setup (10 minutes)

#### Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Configure Environment Variables
1. **Copy the template**:
   ```bash
   cp env_template.txt .env
   ```

2. **Edit the `.env` file** with your API keys:
   ```bash
   # Required API Keys
   GEMINI_API_KEY=your_gemini_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Optional but recommended
   TAVILY_API_KEY=your_tavily_api_key_here
   SERPER_API_KEY=your_serper_api_key_here
   
   # Database (default is fine)
   DATABASE_URL=sqlite:///./alwrity.db
   
   # Security
   SECRET_KEY=your_secret_key_here
   ```

#### Get Your API Keys

**Gemini API Key** (Required):
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy and paste into your `.env` file

**OpenAI API Key** (Required):
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy and paste into your `.env` file

**Tavily API Key** (Optional - for research):
1. Go to [Tavily AI](https://tavily.com/)
2. Sign up and get your API key
3. Add to your `.env` file

**Serper API Key** (Optional - for search):
1. Go to [Serper API](https://serper.dev/)
2. Sign up and get your API key
3. Add to your `.env` file

#### Start the Backend Server
```bash
python start_alwrity_backend.py
```

You should see:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### Step 4: Frontend Setup (10 minutes)

Open a **new terminal window** and navigate to the frontend:

```bash
cd frontend
npm install
```

#### Configure Frontend Environment
1. **Copy the template**:
   ```bash
   cp env_template.txt .env
   ```

2. **Edit the `.env` file**:
   ```bash
   # Backend URL (default is fine)
   VITE_BACKEND_URL=http://localhost:8000
   
   # Optional: Clerk for authentication
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key_here
   
   # Optional: CopilotKit for AI chat
   VITE_COPILOT_API_KEY=your_copilot_key_here
   ```

#### Start the Frontend Server
```bash
npm start
```

You should see:
```
Local:            http://localhost:3000
On Your Network:  http://192.168.1.xxx:3000
```

## ✅ Verification

### Check Backend Health
1. Open your browser to: `http://localhost:8000/health`
2. You should see: `{"status": "healthy", "timestamp": "..."}`

### Check API Documentation
1. Open your browser to: `http://localhost:8000/api/docs`
2. You should see the interactive API documentation

### Check Frontend
1. Open your browser to: `http://localhost:3000`
2. You should see the ALwrity dashboard

## 🎉 Congratulations!

You've successfully set up ALwrity! Here's what you can do now:

### Immediate Next Steps
1. **[Complete the onboarding process](first-content.md)** - Set up your profile
2. **[Create your first blog post](first-content.md)** - Generate content with AI
3. **[Explore the features](features-overview.md)** - See what ALwrity can do

### What's Available Now
- **Blog Writer**: Create AI-powered blog posts
- **SEO Analysis**: Optimize your content for search engines
- **Research Integration**: Fact-checked, research-backed content
- **Content Planning**: Plan and schedule your content

## 🆘 Troubleshooting

### Common Issues

**Backend won't start**:
- Check if port 8000 is already in use
- Verify all API keys are correct
- Check Python version (3.8+ required)

**Frontend won't start**:
- Check if port 3000 is already in use
- Verify Node.js version (18+ required)
- Try deleting `node_modules` and running `npm install` again

**API errors**:
- Verify your API keys are valid and have credits
- Check the backend logs for specific error messages
- Ensure your internet connection is stable

### Getting Help
- **[Troubleshooting Guide](troubleshooting.md)** - Common issues and solutions
- **[Community Forum](https://github.com/AJaySi/ALwrity/discussions)** - Ask questions
- **[GitHub Issues](https://github.com/AJaySi/ALwrity/issues)** - Report bugs

## 🎯 Success Tips

### For Best Results
1. **Use quality API keys** - Invest in good AI service subscriptions
2. **Start simple** - Begin with basic content creation
3. **Be patient** - AI content generation takes 30-60 seconds
4. **Review content** - Always review AI-generated content before publishing

### Common Mistakes to Avoid
1. **Don't skip API key setup** - ALwrity needs AI services to work
2. **Don't ignore error messages** - Read and understand error logs
3. **Don't expect perfection immediately** - AI improves with better prompts
4. **Don't forget to backup** - Keep your `.env` files secure

## 🚀 What's Next?

### This Week
1. **[Create your first content](first-content.md)** - Generate your first blog post
2. **[Set up SEO optimization](seo-optimization.md)** - Improve search rankings
3. **[Explore content planning](content-strategy.md)** - Plan your content calendar

### This Month
1. **[Scale your content production](scaling.md)** - Create more content
2. **[Optimize your workflow](workflow-optimization.md)** - Make it even easier
3. **[Track your performance](performance-tracking.md)** - Monitor your success

## 🎉 Ready for Your First Content?

**[Create your first blog post →](first-content.md)**

---

*Questions? [Join our community](https://github.com/AJaySi/ALwrity/discussions) or [contact support](mailto:support@alwrity.com)!*
