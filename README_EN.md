# AI Drama Video Creation Platform - English Documentation

**End-to-End AI Drama Video Creation Platform - From One-Liner Idea to Complete Video**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-2.0.0-green.svg)](version)

---

## 📋 Overview

**AI Drama Platform** is a complete end-to-end video creation platform powered by AI. Transform a one-liner creative idea into a complete drama video with character consistency, professional storyboards, and automated video generation.

### Key Highlights

- 🎬 **End-to-End Automation** - From idea to video in 7 stages
- 🎭 **Character Consistency** - AI-powered appearance consistency across shots
- 📊 **Professional Storyboard** - Visual editing with standard terminology
- 🎥 **Multi-Model Integration** - LLM + Image Generation + Video Generation
- 🔐 **User Authentication** - JWT-based auth with credit system
- 📱 **Modern UI** - React 18 + Ant Design 5

---

## 🎯 Features

### 1. User System

- ✅ User registration and login
- ✅ JWT authentication
- ✅ Credit system integration
- ✅ Role-based access control

### 2. Project Management

- ✅ Create/Edit/Delete projects
- ✅ Project status tracking
- ✅ Multi-episode support
- ✅ Template system

### 3. AI Script Generation

- ✅ GLM-5 integration for script generation
- ✅ Automatic character extraction
- ✅ Scene analysis
- ✅ Multi-format script support

### 4. Character Consistency System

- ✅ AI-powered feature extraction
- ✅ Standard prompt template generation
- ✅ Cross-shot appearance consistency
- ✅ Seed locking for reproducibility

### 5. Storyboard Editor

- ✅ Visual storyboard editing
- ✅ Professional shot terminology
- ✅ Camera movement controls
- ✅ Drag-and-drop interface

### 6. Image Generation

- ✅ Wanx2.1-t2i-plus integration
- ✅ Batch generation support
- ✅ Style consistency control
- ✅ Multiple aspect ratios

### 7. Video Generation

- ✅ Wan2.6-I2V integration
- ✅ Batch video generation
- ✅ FFmpeg video composition
- ✅ Final export with transitions

### 8. One-Click Generation

- ✅ Complete automation pipeline
- ✅ Real-time progress tracking
- ✅ Error handling and retry
- ✅ Result notification

---

## 🏗️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18 | UI framework |
| TypeScript | 6.0 | Type safety |
| Vite | 8.0 | Build tool |
| Ant Design | 5 | UI components |
| React Router | 7 | Routing |
| TanStack Query | 5 | State management |
| Zustand | 5 | Global state |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16 | API framework |
| Prisma | 5 | ORM |
| SQLite | - | Database |
| JWT | - | Authentication |
| FFmpeg | - | Video processing |

### AI Models

| Model | Purpose | Provider |
|-------|---------|----------|
| GLM-5 | Script generation | OpenAI-compatible |
| Wanx2.1-t2i-plus | Image generation | Alibaba |
| Wan2.6-I2V | Video generation | Alibaba |

---

## 📁 Architecture

### Directory Structure

```
ai-drama-platform/
├── src/                    # Next.js Backend
│   ├── app/
│   │   ├── api/           # 46 API endpoints
│   │   │   ├── auth/      # Authentication
│   │   │   ├── projects/  # Project management
│   │   │   ├── agents/    # AI generation
│   │   │   ├── characters/# Character management
│   │   │   ├── videos/    # Video processing
│   │   │   └── ...
│   │   └── page.tsx
│   └── lib/               # Utilities
│
├── frontend/              # React SPA
│   ├── src/
│   │   ├── components/   # 35+ UI components
│   │   ├── pages/        # 12 pages
│   │   ├── api/          # API client
│   │   ├── stores/       # State management
│   │   └── App.tsx
│   └── package.json
│
├── prisma/               # Data models
│   ├── schema.prisma    # 20 models
│   └── dev.db           # SQLite database
│
└── docs/                # Documentation
    ├── API.md
    ├── ARCHITECTURE.md
    └── DEPLOYMENT.md
```

### Data Models

**20 Prisma Models**:

- User, CreditLog, CreditPackage, Payment
- Project, Episode, Clip, Storyboard, Panel
- Character, CharacterAppearance
- GeneratedImage, GeneratedVideo
- Script, VoiceLine, VoicePreset
- Template, Favorite, ApiKey

---

## 🔄 Workflow

### 7-Stage Pipeline

```
1. Script Generation (GLM-5)
   ↓
2. Character Extraction (AI)
   ↓
3. Scene Analysis (NLP)
   ↓
4. Storyboard Generation (Professional)
   ↓
5. Image Generation (Wanx2.1)
   ↓
6. Video Generation (Wan2.6-I2V)
   ↓
7. Composition & Export (FFmpeg)
```

### Character Consistency

```
AI Feature Extraction
    ↓
Standard Prompt Template
    ↓
Seed Locking
    ↓
IP-Adapter
    ↓
Consistency Guarantee
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- SQLite
- FFmpeg (for video processing)
- API keys for AI models

### Installation

```bash
# Clone repository
git clone https://github.com/Z5Research/ai-drama-platform.git

# Install backend dependencies
cd ai-drama-platform
npm install

# Install frontend dependencies
cd frontend
npm install

# Setup database
cd ..
npx prisma generate
npx prisma db push

# Configure environment
cp .env.example .env
# Edit .env with your API keys
```

### Configuration

Create `.env` file:

```env
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="your-jwt-secret"

# AI Models
LLM_API_KEY="your-llm-api-key"
LLM_BASE_URL="https://api.openai.com/v1"
LLM_MODEL="gpt-4"

IMAGE_API_KEY="your-image-api-key"
IMAGE_API_URL="https://api.example.com/v1/images"

VIDEO_API_KEY="your-video-api-key"
VIDEO_API_URL="https://api.example.com/v1/videos"
```

### Running

```bash
# Start backend (port 3000)
npm run dev

# Start frontend (port 5173)
cd frontend
npm run dev
```

Access the application at `http://localhost:5173`

---

## 📊 Code Statistics

| Metric | Count |
|--------|-------|
| TypeScript Files | 1,040 |
| Total Lines of Code | 19,454 |
| API Endpoints | 46 |
| React Components | 35+ |
| Data Models | 20 |
| Test Screenshots | 36 |

---

## 🧪 Testing

### E2E Testing

The platform has been thoroughly tested with:

- ✅ 5 complete test rounds
- ✅ 36 test screenshots
- ✅ 4 bugs found and fixed
- ✅ Complete data chain validation

See [TEST_REPORT.md](docs/TEST_REPORT.md) for details.

---

## 📄 License

MIT License

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

**Built with ❤️ for AI content creators**