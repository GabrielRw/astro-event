# Astro Event - Astrology Chart Visualization

A modern astrology web app for calculating Western Natal Charts and visualizing planetary positions on an interactive map.

![Next.js](https://img.shields.io/badge/Next.js-14+-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4+-38B2AC?logo=tailwindcss)
![MapLibre](https://img.shields.io/badge/MapLibre-GL-orange)

## Features

### 🌟 Natal Chart Calculator
- Enter birth details (date, time, city)
- Automatic city geocoding with timezone
- Multiple house systems (Placidus, Whole Sign, Koch, etc.)
- Tropical & Sidereal zodiac support
- Extra bodies: Chiron, Lilith, True Node

### 🗺️ Event Analyst (Map Overlay)
- **Planetary Lines**: Visualize planetary positions as compass bearings
- **Interactive Map**: MapLibre map with OpenFreeMap tiles
- **Advanced Rings**: Distance rings (decimal, degree-derived, or IC-based)
- **Intersection Analysis**: Visualize intersection points with automatic street name lookup
- **Smart Geocoding**: Hover address lookup and precise location search
- **Customizable**: Toggle between Metric (km) and Imperial (miles) units
- **Event Management**: 8 pre-loaded historical events + custom event creation

---

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/GabrielRw/astro-event.git
cd astro-event
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your FreeAstroAPI key:

```env
FREEASTROAPI_KEY=your_api_key_here
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `FREEASTROAPI_KEY` | Yes | Your FreeAstroAPI key for natal chart calculations |

### Getting an API Key

1. Visit [FreeAstroAPI](https://www.freeastroapi.com)
2. Create an account
3. Generate an API key from the dashboard
4. Copy the key to your `.env.local` file

> ⚠️ **Security**: Never commit `.env.local` to git. It's already in `.gitignore`.

---

## Deployment on Netlify

### Option 1: Deploy with Netlify Button
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/GabrielRw/astro-event)

### Option 2: Manual Deployment

1. **Connect Repository**
   - Go to [Netlify](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub account
   - Select the `astro-event` repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - The `netlify.toml` file handles this automatically

3. **Set Environment Variables**
   - Go to Site settings → Environment variables
   - Click "Add a variable"
   - Add:
     - Key: `FREEASTROAPI_KEY`
     - Value: `your_api_key_here`
   - Click "Save"

4. **Deploy**
   - Trigger a new deploy from the Deploys tab
   - Or push to your main branch to auto-deploy

### Updating the API Key on Netlify

1. Go to your site on Netlify
2. Navigate to **Site settings** → **Environment variables**
3. Find `FREEASTROAPI_KEY`
4. Click the three dots → **Edit**
5. Update the value
6. Click **Save**
7. **Trigger a redeploy** (Deploys → Trigger deploy → Deploy site)

---

## Project Structure

```
astro-event/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Home - Natal Chart Form
│   ├── result/page.tsx           # Chart Results
│   ├── event-analyst/page.tsx    # Event Analyst Map
│   └── api/
│       ├── geo/search/route.ts   # City autocomplete
│       └── natal/route.ts        # Chart calculation
├── components/                   # Shared UI components
├── src/
│   ├── config/mapConfig.ts       # MapLibre settings
│   └── features/event-analyst/   # Event Analyst feature
├── lib/                          # Utilities & API client
├── .env.example                  # Environment template
├── netlify.toml                  # Netlify config
└── package.json
```

---

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod
- **Maps**: MapLibre GL + OpenFreeMap
- **API**: FreeAstroAPI (Swiss Ephemeris)

---

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## License

MIT License - See [LICENSE](LICENSE) for details.

---

## Acknowledgments

- [FreeAstroAPI](https://www.freeastroapi.com) - Astrology calculations
- [OpenFreeMap](https://openfreemap.org) - Map tiles
- [MapLibre GL](https://maplibre.org) - Map rendering
