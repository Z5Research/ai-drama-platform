# 智午AI漫剧自动化平台 - 中文文档

**Z5 AI Drama Video Creation Platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**智午研究院出品**

---

## 📖 产品价值

### 为内容创作者赋能

智午AI漫剧自动化平台是专为内容创作者设计的端到端AI视频创作系统。只需输入一句话创意，即可自动生成完整的漫剧视频，大大降低视频创作门槛，提升创作效率。

### 核心价值

| 价值维度 | 传统方式 | AI自动化平台 | 提升效果 |
|---------|---------|-------------|---------|
| **创作效率** | 数天-数周 | 数小时 | **10x 提升** |
| **专业门槛** | 需专业团队 | 零基础可用 | **降低90%** |
| **成本投入** | 数万起 | 按需付费 | **降低80%** |
| **迭代速度** | 周级 | 分钟级 | **100x 提升** |

---

## 🎯 应用场景

### 1. 短视频内容创作
- 抖音、快手、视频号等平台的短剧制作
- 批量化、标准化生产短视频内容
- 每日生产10-50条高质量短剧

### 2. 品牌营销视频
- 企业宣传、产品发布、活动推广
- 快速产出专业品质营销视频
- 品牌故事、产品演示视频制作

### 3. 教育培训内容
- 在线课程、教学视频、知识普及
- 将文字教材转化为生动视频
- 课程配套视频、知识点动画

### 4. 个人IP打造
- 自媒体、Vlog、个人品牌
- 低成本持续输出优质内容
- 个人IP系列视频制作

### 5. 广告素材生成
- 电商广告、信息流广告
- 快速生成大量A/B测试素材
- 电商产品视频批量生成

---

## 🏗️ 系统架构

### 技术栈

| 层级 | 技术栈 |
|------|--------|
| 前端 | React 18 + Vite + Ant Design 5 |
| 后端 | Next.js 16 + Prisma 5 + SQLite |
| AI | GLM-5 + Wanx2.1 + Wan2.6 |
| 视频 | FFmpeg |

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

### 7阶段自动化

```
1. 剧本生成 (GLM-5) → 完整剧本 + 角色设定
2. 角色提取 (AI) → 标准化角色特征
3. 场景分析 (NLP) → 专业场景描述
4. 分镜生成 → 镜头脚本
5. 图像生成 (Wanx2.1) → 高质量关键帧
6. 视频生成 (Wan2.6) → 视频片段
7. 合成导出 (FFmpeg) → 最终成品
```

---

## ✨ 核心特色

### 1. 角色一致性控制（行业领先）

- AI特征自动提取
- 标准提示词模板
- Seed锁定技术
- 跨镜头一致性达90%+

### 2. 多模型协同架构

- GLM-5: 剧本生成（中文理解强）
- Wanx2.1: 图像生成（质量高）
- Wan2.6: 视频生成（一致性好）

### 3. 专业分镜系统

- 标准电影镜头术语
- 景别、运镜、构图设计
- 可视化编辑器

### 4. 一键生成能力

- 完整7阶段自动化
- 实时进度反馈
- 智能错误处理

---

## 🚀 快速开始

### 环境要求

- Node.js 18+
- SQLite
- FFmpeg
- AI模型API密钥

### 安装

```bash
git clone https://github.com/Z5Research/ai-drama-platform.git
cd ai-drama-platform
npm install
cd frontend && npm install && cd ..
npx prisma generate
npx prisma db push
cp .env.example .env
# 编辑.env配置API密钥
npm run dev
```

访问: http://localhost:5173

---

## 📄 许可证

MIT License

Copyright (c) 2026 智午研究院

---

**智午研究院 | Zhiwu Research Institute**

用AI技术赋能内容创作