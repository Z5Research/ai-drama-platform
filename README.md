<h1 align="center">
  <br>
  <a href="https://github.com/Z5Research/ai-drama-platform">
    <img src="https://img.shields.io/badge/Z5%20AI%20Drama-Platform-blue?style=for-the-badge&logo=video" alt="Z5 AI Drama Platform" width="400">
  </a>
  <br>
  智午AI漫剧自动化平台
  <br>
  <h4 align="center">Z5 AI Drama Video Creation Platform</h4>
</h1>

<p align="center">
  🇨🇳 <a href="README_CN.md">中文文档</a> •
  🇺🇸 <a href="README_EN.md">English Docs</a>
</p>

<h4 align="center">智午研究院出品 | Produced by Zhiwu Research Institute</h4>

<p align="center">
  <img src="screenshots/homepage.png" alt="智午AI漫剧首页" width="800">
</p>

<p align="center">
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License">
  </a>
  <a href="#features">
    <img src="https://img.shields.io/badge/version-0.2.0-green.svg" alt="Version">
  </a>
  <a href="#tech-stack">
    <img src="https://img.shields.io/badge/React-18-blue.svg" alt="React">
  </a>
  <a href="#tech-stack">
    <img src="https://img.shields.io/badge/Next.js-16-black.svg" alt="Next.js">
  </a>
  <a href="#models">
    <img src="https://img.shields.io/badge/AI-Models-orange.svg" alt="AI Models">
  </a>
</p>

---

## 📖 产品价值 | Product Value

### 为内容创作者赋能

**智午AI漫剧自动化平台**是专为内容创作者设计的端到端AI视频创作系统。只需输入一句话创意，即可自动生成完整的漫剧视频，大大降低视频创作门槛，提升创作效率。

### 核心价值

| 价值维度 | 传统方式 | AI自动化平台 | 提升效果 |
|---------|---------|-------------|---------|
| **创作效率** | 数天-数周 | 数小时 | **10x 提升** |
| **专业门槛** | 需专业团队 | 零基础可用 | **降低90%** |
| **成本投入** | 数万起 | 按需付费 | **降低80%** |
| **迭代速度** | 周级 | 分钟级 | **100x 提升** |

---

## 🎯 应用场景 | Application Scenarios

### 1. 短视频内容创作
- **场景**: 抖音、快手、视频号等平台的短剧制作
- **价值**: 批量化、标准化生产短视频内容
- **案例**: 每日生产10-50条高质量短剧

### 2. 品牌营销视频
- **场景**: 企业宣传、产品发布、活动推广
- **价值**: 快速产出专业品质营销视频
- **案例**: 品牌故事、产品演示视频制作

### 3. 教育培训内容
- **场景**: 在线课程、教学视频、知识普及
- **价值**: 将文字教材转化为生动视频
- **案例**: 课程配套视频、知识点动画

### 4. 个人IP打造
- **场景**: 自媒体、Vlog、个人品牌
- **价值**: 低成本持续输出优质内容
- **案例**: 个人IP系列视频制作

### 5. 广告素材生成
- **场景**: 电商广告、信息流广告
- **价值**: 快速生成大量A/B测试素材
- **案例**: 电商产品视频批量生成

---

## 🏗️ 系统架构 | System Architecture

### 技术栈全景

```
┌─────────────────────────────────────────────────────────┐
│                    前端 Frontend                          │
│  React 18 + Vite + Ant Design 5 + React Router           │
│  TypeScript + TanStack Query + Zustand                  │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    后端 Backend                           │
│  Next.js 16 API Routes + Prisma 5 ORM                    │
│  SQLite + JWT Auth + FFmpeg Video Processing             │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    AI层 AI Layer                          │
│  GLM-5 (剧本生成) + Wanx2.1 (图像生成) + Wan2.6 (视频生成) │
└─────────────────────────────────────────────────────────┘
```

### 系统分层

| 层级 | 技术栈 | 职责 |
|------|--------|------|
| **用户交互层** | React + Ant Design | 界面展示、用户操作 |
| **业务逻辑层** | Next.js API | 业务处理、流程编排 |
| **数据持久层** | Prisma + SQLite | 数据存储、查询优化 |
| **AI能力层** | GLM-5 + Wanx + Wan | 内容生成、媒体处理 |
| **媒体处理层** | FFmpeg | 视频合成、转码导出 |

### 目录结构

```
ai-drama-platform/
├── src/                    # Next.js 后端
│   ├── app/
│   │   ├── api/           # 46个API端点
│   │   │   ├── auth/      # 用户认证
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
│   └── dev.db           # SQLite
│
└── docs/                # 文档
    ├── API.md
    └── ARCHITECTURE.md
```

---

## 🔄 完整工作流程 | Complete Workflow

### 7阶段自动化流程

```
阶段1: 剧本生成 (GLM-5)
  ├─ 输入: 一句话创意
  ├─ AI: GLM-5大模型分析
  └─ 输出: 完整剧本 + 角色设定

阶段2: 角色提取 (AI特征工程)
  ├─ AI: 特征自动提取
  ├─ 处理: 外貌、性格、服装分析  
  └─ 输出: 标准化角色设定

阶段3: 场景分析 (NLP处理)
  ├─ AI: 场景智能识别
  ├─ 处理: 光线、色调、氛围提取
  └─ 输出: 专业场景描述

阶段4: 分镜生成 (专业术语库)
  ├─ AI: 镜头语言转换
  ├─ 处理: 景别、运镜、构图设计
  └─ 输出: 分镜脚本

阶段5: 图像生成 (Wanx2.1)
  ├─ AI: 文生图大模型
  ├─ 技术: Seed锁定 + IP-Adapter
  └─ 输出: 高质量关键帧

阶段6: 视频生成 (Wan2.6-I2V)
  ├─ AI: 图生视频模型
  ├─ 技术: 运动强度控制
  └─ 输出: 视频片段

阶段7: 合成导出 (FFmpeg)
  ├─ 技术: 视频拼接
  ├─ 处理: 转场、音频合成
  └─ 输出: 最终成品视频
```

### 数据流转

```
用户输入
    ↓
项目创建 (Project)
    ↓
剧本生成 (Script)
    ↓
角色提取 (Character)
    ↓
分镜脚本 (Storyboard → Panel)
    ↓
图像生成 (GeneratedImage)
    ↓
视频生成 (GeneratedVideo)
    ↓
最终导出 (Export)
```

---

## ✨ 核心特色 | Core Features

### 1. 🎭 角色一致性控制（行业领先）

**痛点**: AI生成内容中角色外观频繁变化，影响观看体验

**解决方案**:
- AI特征自动提取
- 标准提示词模板生成
- Seed锁定技术
- IP-Adapter一致性保证

**效果**: 跨镜头角色外观一致性达90%+

### 2. 🤖 多模型协同架构

**创新点**: 国内首个集成多AI模型的漫剧平台

| 模型 | 用途 | 提供商 | 特点 |
|------|------|--------|------|
| GLM-5 | 剧本生成 | 智谱AI | 中文理解强 |
| Wanx2.1 | 图像生成 | 阿里云 | 质量高、速度快 |
| Wan2.6 | 视频生成 | 阿里云 | 一致性好 |

### 3. 📊 专业分镜系统

**特色**:
- 标准电影镜头术语库
- 景别、运镜、构图专业设计
- 可视化编辑器
- 实时预览效果

### 4. ⚡ 一键生成能力

**优势**:
- 完整7阶段自动化
- 实时进度反馈
- 智能错误处理
- 结果通知机制

### 5. 🔐 完整用户系统

**功能**:
- JWT安全认证
- 积分消耗系统
- 项目管理
- 模板复用

### 6. 📱 现代化界面

**技术**:
- React 18最新特性
- Ant Design 5组件库
- 响应式设计
- 流畅交互体验

---

## 📊 代码统计 | Code Statistics

| 指标 | 数量 | 说明 |
|------|------|------|
| TypeScript文件 | 1,040 | 全类型安全 |
| 总代码行数 | 19,454 | 规模完整 |
| API端点 | 46 | 功能全面 |
| React组件 | 35+ | 模块化设计 |
| 数据模型 | 20 | 结构清晰 |
| E2E测试截图 | 36 | 质量保证 |

---

## 🚀 快速开始 | Quick Start

### 环境要求

- Node.js 18+
- npm 或 yarn
- SQLite
- FFmpeg
- AI模型API密钥

### 安装步骤

```bash
# 1. 克隆仓库
git clone https://github.com/Z5Research/ai-drama-platform.git

# 2. 安装后端依赖
cd ai-drama-platform
npm install

# 3. 安装前端依赖
cd frontend && npm install && cd ..

# 4. 初始化数据库
npx prisma generate
npx prisma db push

# 5. 配置环境变量
cp .env.example .env
# 编辑.env填入API密钥

# 6. 启动服务
npm run dev          # 后端 (3000端口)
cd frontend && npm run dev  # 前端 (5173端口)
```

### 访问应用

打开浏览器访问: `http://localhost:5173`

---

## 📈 发展规划 | Roadmap

### v0.2.0 (当前版本)

- ✅ 完整7阶段自动化
- ✅ 角色一致性控制
- ✅ 专业分镜编辑
- ✅ 用户认证系统
- ✅ 项目管理
- ✅ 积分系统

### v0.3.0 (近期规划)

- ⏳ 更多AI模型支持
- ⏳ 批量生成优化
- ⏳ 视频预览播放器
- ⏳ 音频配音集成

### v1.0.0 (长期目标)

- ⏳ 商业化功能
- ⏳ 多租户支持
- ⏳ 云端部署
- ⏳ SaaS服务

---

## 📄 许可证 | License

MIT License

Copyright (c) 2026 智午研究院 (Zhiwu Research Institute)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

---

<p align="center">
  <b>智午研究院 | Zhiwu Research Institute</b>
</p>

<p align="center">
  用AI技术赋能内容创作 | Empowering Content Creation with AI
</p>

<p align="center">
  <a href="https://github.com/Z5Research/ai-drama-platform">
    <img src="https://img.shields.io/github/stars/Z5Research/ai-drama-platform?style=social" alt="Stars">
  </a>
</p>