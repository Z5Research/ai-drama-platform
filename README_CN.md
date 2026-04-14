# AI漫剧视频创作平台 - 中文文档

**端到端AI漫剧视频创作系统 - 从一句话创意到完整视频**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-2.0.0-green.svg)](version)

---

## 📋 概述

**AI漫剧视频创作平台**是一个完整的端到端AI视频创作系统。将一句话创意转化为完整的漫剧视频，支持角色一致性、专业分镜和自动化视频生成。

### 核心亮点

- 🎬 **端到端自动化** - 7阶段完整流程
- 🎭 **角色一致性** - AI驱动的跨镜头外观一致
- 📊 **专业分镜** - 标准术语的可视化编辑
- 🎥 **多模型集成** - LLM + 图像生成 + 视频生成
- 🔐 **用户认证** - JWT认证 + 积分系统
- 📱 **现代UI** - React 18 + Ant Design 5

---

## 🎯 功能特性

### 1. 用户系统

- ✅ 用户注册和登录
- ✅ JWT认证
- ✅ 积分系统集成
- ✅ 基于角色的访问控制

### 2. 项目管理

- ✅ 创建/编辑/删除项目
- ✅ 项目状态跟踪
- ✅ 多剧集支持
- ✅ 模板系统

### 3. AI剧本生成

- ✅ GLM-5集成生成剧本
- ✅ 自动角色提取
- ✅ 场景分析
- ✅ 多格式剧本支持

### 4. 角色一致性系统

- ✅ AI驱动的特征提取
- ✅ 标准提示词模板生成
- ✅ 跨镜头外观一致性
- ✅ Seed锁定确保可重现性

### 5. 分镜编辑器

- ✅ 可视化分镜编辑
- ✅ 专业镜头术语
- ✅ 运镜控制
- ✅ 拖拽界面

### 6. 图像生成

- ✅ Wanx2.1-t2i-plus集成
- ✅ 批量生成支持
- ✅ 风格一致性控制
- ✅ 多种画幅比例

### 7. 视频生成

- ✅ Wan2.6-I2V集成
- ✅ 批量视频生成
- ✅ FFmpeg视频合成
- ✅ 带转场的最终导出

### 8. 一键生成

- ✅ 完整自动化流程
- ✅ 实时进度跟踪
- ✅ 错误处理和重试
- ✅ 结果通知

---

## 🏗️ 技术栈

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18 | UI框架 |
| TypeScript | 6.0 | 类型安全 |
| Vite | 8.0 | 构建工具 |
| Ant Design | 5 | UI组件 |
| React Router | 7 | 路由 |
| TanStack Query | 5 | 状态管理 |
| Zustand | 5 | 全局状态 |

### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 16 | API框架 |
| Prisma | 5 | ORM |
| SQLite | - | 数据库 |
| JWT | - | 认证 |
| FFmpeg | - | 视频处理 |

### AI模型

| 模型 | 用途 | 提供商 |
|------|------|--------|
| GLM-5 | 剧本生成 | OpenAI兼容 |
| Wanx2.1-t2i-plus | 图像生成 | 阿里云 |
| Wan2.6-I2V | 视频生成 | 阿里云 |

---

## 📁 系统架构

### 目录结构

```
ai-drama-platform/
├── src/                    # Next.js 后端
│   ├── app/
│   │   ├── api/           # 46个API端点
│   │   │   ├── auth/      # 认证
│   │   │   ├── projects/  # 项目管理
│   │   │   ├── agents/    # AI生成
│   │   │   ├── characters/# 角色管理
│   │   │   ├── videos/    # 视频处理
│   │   │   └── ...
│   │   └── page.tsx
│   └── lib/               # 工具库
│
├── frontend/              # React SPA
│   ├── src/
│   │   ├── components/   # 35+ UI组件
│   │   ├── pages/        # 12个页面
│   │   ├── api/          # API客户端
│   │   ├── stores/       # 状态管理
│   │   └── App.tsx
│   └── package.json
│
├── prisma/               # 数据模型
│   ├── schema.prisma    # 20个模型
│   └── dev.db           # SQLite数据库
│
└── docs/                # 文档
    ├── API.md
    ├── ARCHITECTURE.md
    └── DEPLOYMENT.md
```

### 数据模型

**20个Prisma模型**:

- User, CreditLog, CreditPackage, Payment
- Project, Episode, Clip, Storyboard, Panel
- Character, CharacterAppearance
- GeneratedImage, GeneratedVideo
- Script, VoiceLine, VoicePreset
- Template, Favorite, ApiKey

---

## 🔄 工作流程

### 7阶段自动化流程

```
1. 剧本生成 (GLM-5)
   ↓
2. 角色提取 (AI)
   ↓
3. 场景分析 (NLP)
   ↓
4. 分镜生成 (专业术语)
   ↓
5. 图像生成 (Wanx2.1)
   ↓
6. 视频生成 (Wan2.6-I2V)
   ↓
7. 合成导出 (FFmpeg)
```

### 角色一致性控制

```
AI特征提取
    ↓
标准提示词模板
    ↓
Seed锁定
    ↓
IP-Adapter
    ↓
一致性保证
```

---

## 🚀 快速开始

### 前置要求

- Node.js 18+
- npm 或 yarn
- SQLite
- FFmpeg (视频处理)
- AI模型API密钥

### 安装

```bash
# 克隆仓库
git clone https://github.com/Z5Research/ai-drama-platform.git

# 安装后端依赖
cd ai-drama-platform
npm install

# 安装前端依赖
cd frontend
npm install

# 设置数据库
cd ..
npx prisma generate
npx prisma db push

# 配置环境变量
cp .env.example .env
# 编辑.env填入你的API密钥
```

### 配置

创建 `.env` 文件:

```env
# 数据库
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="your-jwt-secret"

# AI模型
LLM_API_KEY="your-llm-api-key"
LLM_BASE_URL="https://api.openai.com/v1"
LLM_MODEL="gpt-4"

IMAGE_API_KEY="your-image-api-key"
IMAGE_API_URL="https://api.example.com/v1/images"

VIDEO_API_KEY="your-video-api-key"
VIDEO_API_URL="https://api.example.com/v1/videos"
```

### 运行

```bash
# 启动后端 (端口3000)
npm run dev

# 启动前端 (端口5173)
cd frontend
npm run dev
```

访问应用: `http://localhost:5173`

---

## 📊 代码统计

| 指标 | 数量 |
|------|------|
| TypeScript文件 | 1,040 |
| 总代码行数 | 19,454 |
| API端点 | 46 |
| React组件 | 35+ |
| 数据模型 | 20 |
| 测试截图 | 36 |

---

## 🧪 测试

### E2E测试

平台经过全面测试:

- ✅ 5轮完整测试
- ✅ 36张测试截图
- ✅ 4个Bug已修复
- ✅ 完整数据链路验证

详见 [TEST_REPORT.md](docs/TEST_REPORT.md)

---

## 📄 许可证

MIT License

Copyright (c) 2026

特此免费授予任何获得本软件副本和相关文档文件（"软件"）的人不受限制地处置该软件的权利，包括不受限制地使用、复制、修改、合并、发布、分发、再许可和/或出售该软件副本，以及再授权被配发了本软件的人如上的权利，须在下列条件下：

上述版权声明和本许可声明应包含在该软件的所有副本或实质成分中。

本软件按"原样"提供，不提供任何形式的担保，包括但不限于适销性、特定用途适用性和非侵权性的担保。在任何情况下，作者或版权持有人不对任何索赔、损害或其他责任负责，无论是在合同诉讼、侵权行为或其他方面，由软件或软件的使用或其他交易引起。

---

**为AI内容创作者用心构建**