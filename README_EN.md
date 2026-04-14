# Z5 AI Drama Video Creation Platform - English Documentation

**智午AI漫剧自动化平台**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Produced by Zhiwu Research Institute**

---

## Product Value

### Empowering Content Creators

Z5 AI Drama Video Creation Platform is an end-to-end AI video creation system designed for content creators. Transform a one-liner creative idea into a complete drama video with minimal effort and maximum efficiency.

### Core Value Proposition

| Dimension | Traditional Way | AI Platform | Improvement |
|-----------|----------------|-------------|-------------|
| **Efficiency** | Days to Weeks | Hours | **10x Faster** |
| **Barrier to Entry** | Professional Team Required | Zero Experience Needed | **90% Lower** |
| **Cost** | Tens of Thousands | Pay-as-you-go | **80% Reduction** |
| **Iteration Speed** | Weekly | Minutes | **100x Faster** |

---

## Application Scenarios

### 1. Short Video Content Creation
- Platforms: TikTok, Kuaishou, Video Accounts
- Batch production of high-quality short dramas
- Daily output: 10-50 videos

### 2. Brand Marketing Videos
- Corporate promotion, product launches
- Professional quality marketing videos
- Brand stories, product demos

### 3. Educational Content
- Online courses, teaching videos
- Transform text materials into engaging videos
- Course companion videos, animated knowledge points

### 4. Personal IP Building
- Self-media, Vlogs, personal branding
- Low-cost continuous content production
- Personal IP series videos

### 5. Ad Material Generation
- E-commerce ads, feed ads
- Rapid A/B test material generation
- Batch product video creation

---

## System Architecture

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite + Ant Design 5 |
| Backend | Next.js 16 + Prisma 5 + SQLite |
| AI | GLM-5 + Wanx2.1 + Wan2.6 |
| Video | FFmpeg |

### Data Models

**20 Prisma Models**:
- User, CreditLog, CreditPackage, Payment
- Project, Episode, Clip, Storyboard, Panel
- Character, CharacterAppearance
- GeneratedImage, GeneratedVideo
- Script, VoiceLine, VoicePreset
- Template, Favorite, ApiKey

---

## Workflow

### 7-Stage Automation

```
1. Script Generation (GLM-5) → Complete script + character setup
2. Character Extraction (AI) → Standardized character features
3. Scene Analysis (NLP) → Professional scene descriptions
4. Storyboard Generation → Shot scripts
5. Image Generation (Wanx2.1) → High-quality keyframes
6. Video Generation (Wan2.6) → Video clips
7. Composition & Export (FFmpeg) → Final product
```

---

## Core Features

### 1. Character Consistency Control (Industry Leading)

- AI-powered feature extraction
- Standard prompt templates
- Seed locking technology
- 90%+ cross-shot consistency

### 2. Multi-Model Collaborative Architecture

- GLM-5: Script generation (Strong Chinese understanding)
- Wanx2.1: Image generation (High quality)
- Wan2.6: Video generation (Good consistency)

### 3. Professional Storyboard System

- Standard cinematic terminology
- Shot size, camera movement, composition design
- Visual editor

### 4. One-Click Generation

- Complete 7-stage automation
- Real-time progress feedback
- Intelligent error handling

---

## Quick Start

### Requirements

- Node.js 18+
- SQLite
- FFmpeg
- AI model API keys

### Installation

```bash
git clone https://github.com/Z5Research/ai-drama-platform.git
cd ai-drama-platform
npm install
cd frontend && npm install && cd ..
npx prisma generate
npx prisma db push
cp .env.example .env
# Edit .env with API keys
npm run dev
```

Access: http://localhost:5173

---

## License

MIT License

Copyright (c) 2026 Zhiwu Research Institute

---

**Zhiwu Research Institute**

Empowering Content Creation with AI