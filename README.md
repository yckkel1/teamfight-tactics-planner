# ⚔️ Teamfight Tactics Planner

A full-stack web application for planning and optimizing team compositions for TFT Set 15: K.O. Coliseum.

**Live App:** [teamfight-tactics-planner.vercel.app](https://teamfight-tactics-planner.vercel.app)

---

## ✨ Features

- **📊 Champions Explorer** - Browse all Set 15 champions with detailed stats, abilities, and traits
- **🎯 Traits Database** - View trait bonuses and tier breakpoints with live champion lists
- **⚡ Items Catalog** - Explore components, completed items, artifacts, radiant items, and emblems
- **🎮 Team Builder** - Drag-and-drop interface to build team compositions with live trait activation tracking

---

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first styling
- **TanStack Query** - Server state management

### Backend
- **Fastify** - High-performance Node.js API framework
- **Prisma ORM** - Type-safe database client
- **PostgreSQL** - Production database
- **Zod** - Runtime schema validation

### Infrastructure
- **Vercel** - Frontend hosting
- **Railway** - API hosting with PostgreSQL
- **pnpm** - Monorepo workspace management

---

## 📁 Project Structure
```
teamfight-tactics-planner/
├── apps/
│   ├── api/              # Fastify REST API
│   └── web/              # Next.js frontend
├── packages/
│   └── data/models/      # Shared TypeScript types
└── prisma/
    ├── data/            # Game data (units, traits, items)
    ├── migrations/      # Database migrations
    └── schema.prisma    # Database schema
```

---

## 🌐 API Endpoints

**Traits**
- `GET /traits` - List all traits with tier breakpoints
- `GET /traits?search=soul` - Search traits

**Champions**
- `GET /units` - List all champions
- `GET /units?cost=4` - Filter by cost
- `GET /units?trait=Duelist` - Filter by trait
- `GET /units/:id` - Get champion details

**Items**
- `GET /items` - List all items
- `GET /items?category=component` - Filter by type
- `GET /items/:slug` - Get item details

---

## 📄 License

**All Rights Reserved** - This code is proprietary and confidential. Unauthorized copying, distribution, or use of this software is strictly prohibited without explicit written permission from the author.

---

## 🙏 Acknowledgments

Game data sourced from official TFT Set 15 patch notes and community resources.
