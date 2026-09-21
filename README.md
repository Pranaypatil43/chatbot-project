# Chatbot Project

A React + Vite chatbot powered by the [Groq API](https://console.groq.com/).

## Tech Stack

- **React 18** — UI
- **Vite 6** — build tool & dev server
- **Groq SDK** — LLM inference

## Local Development

1. **Clone the repo**

   ```bash
   git clone <your-repo-url>
   cd chatbot-project
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy `.env.example` to `.env` and fill in your Groq API key:

   ```bash
   cp .env.example .env
   ```

   Then edit `.env`:

   ```
   VITE_GROQ_API_KEY=your_groq_api_key_here
   ```

   Get a free API key at [console.groq.com](https://console.groq.com/).

4. **Start the dev server**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`.

## Deploying to Vercel

### Option 1 — Vercel Dashboard (recommended)

1. Push this repo to GitHub (or GitLab / Bitbucket).
2. Go to [vercel.com](https://vercel.com) and click **Add New Project**.
3. Import your repository — Vercel will auto-detect Vite and set the build config for you.
4. Before deploying, add your environment variable:
   - Go to **Settings → Environment Variables**
   - Add `VITE_GROQ_API_KEY` with your Groq API key as the value
   - Apply to **Production**, **Preview**, and **Development** as needed
5. Click **Deploy**.

### Option 2 — Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

Follow the prompts. When asked for environment variables, add `VITE_GROQ_API_KEY`.

To deploy to production:

```bash
vercel --prod
```

### Environment Variables on Vercel

| Variable | Description |
|---|---|
| `VITE_GROQ_API_KEY` | Your Groq API key from [console.groq.com](https://console.groq.com/) |

> **Note:** Never commit your `.env` file. It is already listed in `.gitignore`.

## Build

```bash
npm run build      # outputs to /dist
npm run preview    # preview the production build locally
```
