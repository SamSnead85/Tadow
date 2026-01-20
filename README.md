# Verity - AI-Powered Decision Concierge

> Make confident purchase decisions with personalized recommendations and transparent scoring.

Verity is a premium product research platform that guides users from a vague need to a confident purchase decision through a conversational AI assistant and transparent scoring system.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ 
- npm 10+

### Installation

```bash
# Clone the repository (or navigate to the project directory)
cd "Amazon killer"

# Install all dependencies
npm install

# Set up the database
cd apps/api
npx prisma db push
npm run db:seed
cd ../..

# Start both frontend and backend
npm run dev
```

The app will be running at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

## 📁 Project Structure

```
verity/
├── package.json                 # Root monorepo config
├── apps/
│   ├── web/                     # React Frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── VerityAssistant/   # Conversational homepage
│   │   │   │   ├── ProductDNA/        # Product detail components
│   │   │   │   └── PriceEngine/       # Price comparison
│   │   │   ├── pages/
│   │   │   ├── utils/
│   │   │   └── data/                  # Mock data
│   │   └── ...
│   └── api/                     # Express Backend
│       ├── prisma/
│       │   ├── schema.prisma          # Database schema
│       │   └── seed.ts                # Seed data
│       └── src/
│           ├── routes/
│           └── index.ts
└── README.md
```

## ✨ Features

### 1. Verity Assistant (Conversational UI)
- Full-screen chat interface
- Dynamic questionnaire flow
- Persona-based recommendations
- Smooth animations with Framer Motion

### 2. Verity Score
- Transparent 1-100 scoring system
- Hover breakdown showing component scores:
  - Performance
  - Display Quality
  - Battery Life
  - Value for Money
  - Build Quality

### 3. Product DNA Dashboard
- One-sentence "Bottom Line" summary
- AI-summarized user reviews
- Technical specifications
- Strengths & weaknesses analysis

### 4. Universal Price Engine
- Multi-retailer price comparison
- Lowest price highlighting
- Real-time stock status
- Affiliate-ready buy buttons

## 🎨 Design System

Verity uses a premium, minimalist design language:

- **Colors**: Deep blacks (noir palette), Verity Blue (#2563eb) accent
- **Typography**: Inter (body), Space Grotesk (display), JetBrains Mono (data)
- **Effects**: Subtle glassmorphism, smooth 200-300ms transitions
- **Philosophy**: No ads, no sponsored content, ever.

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/products` | GET | List all products |
| `/api/products/:id` | GET | Get product details |
| `/api/recommendations` | POST | Get personalized recommendations |
| `/api/prices/:productId` | GET | Get prices for a product |

### Example: Get Recommendations

```bash
curl -X POST http://localhost:3001/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "primaryUse": "travel",
    "budget": "1200-2000",
    "priority": "portability",
    "importance": "weight"
  }'
```

## 🗃️ Database Schema

Using SQLite with Prisma ORM:

- **User**: Stores user profiles and questionnaire answers
- **Product**: Laptops with specs, Verity Scores, and AI summaries
- **Price**: Multi-retailer pricing with stock status
- **Review**: User reviews for AI summarization

## 🛠️ Development

```bash
# Start frontend only
npm run dev:web

# Start backend only
npm run dev:api

# Open Prisma Studio (database GUI)
npm run db:studio

# Re-seed the database
npm run db:seed
```

## 🎯 Personas

Verity maps users to one of 7 personas:

| Persona | Description |
|---------|-------------|
| 🌍 Digital Nomad | Prioritizes portability and battery |
| 🎨 Creative Professional | Needs display quality and performance |
| 🎮 Competitive Gamer | Wants high refresh rates and GPU power |
| 💼 Business Traveler | Values reliability and security |
| 📚 Versatile Student | Seeks balance and value |
| ⚡ Power User | Demands maximum performance |
| 🔧 Tinkerer | Loves upgradeability and customization |

## 📝 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, TypeScript
- **Database**: SQLite with Prisma ORM
- **UI Icons**: Lucide React

## 🚧 Roadmap

- [ ] Real AI/LLM integration for recommendations
- [ ] User authentication and saved preferences
- [ ] Price tracking and alerts
- [ ] More product categories
- [ ] Real-time price scraping

## 📄 License

MIT License - Built with ❤️ to help people make better decisions.
