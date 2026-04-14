/**
 * AI漫剧一致性约束配置
 * 同步自 ai-drama-automation 技能 v2.1.0
 */

// ========================================
// 全局一致性约束
// ========================================

export const GLOBAL_CONSTRAINTS = {
  // 角色一致性
  character: {
    enabled: true,
    rules: [
      '全程固定角色外貌、服饰、肤色、发型、身高比例',
      '禁止变形、换装、变脸',
    ],
  },
  
  // 场景一致性
  scene: {
    enabled: true,
    rules: [
      '固定场景空间、陈设、光影、色调',
      '禁止场景突变、物品凭空增减',
    ],
  },
  
  // 风格一致性
  style: {
    enabled: true,
    rules: [
      '固定艺术风格、分辨率、帧率、色彩方案',
      '全程统一运镜逻辑',
      '禁止风格漂移',
    ],
  },
  
  // 叙事一致性
  narrative: {
    enabled: true,
    rules: [
      '严格围绕核心主题',
      '无支线、无偏离、无无关内容',
    ],
  },
  
  // 禁止行为
  forbidden: [
    'free_creation',      // 禁止自由创作
    'style_drift',        // 禁止风格漂移
    'undefined_elements', // 禁止新增未定义元素
    'emotion_shift',      // 禁止改变情绪基调
  ],
}

// ========================================
// 元数据锚点模板
// ========================================

export interface AnchorTemplate {
  core_topic: string
  emotion: string
  video_duration: string
  main_character: {
    identity: string
    appearance: string
    clothing: string
    habitual_action: string
  }
  main_scene: {
    location: string
    environment: string
    lighting: string
    color_tone: string
  }
  voice_anchor?: {
    voice_type: string
    voice_style: string
    voice_speed: string
    voice_pitch: string
    voice_emotion: string
  }
  visual_style: string
  camera_style: string
  color_theme: string
}

export const DEFAULT_ANCHOR: AnchorTemplate = {
  core_topic: '',
  emotion: '',
  video_duration: '60s',
  main_character: {
    identity: '',
    appearance: '',
    clothing: '',
    habitual_action: '',
  },
  main_scene: {
    location: '',
    environment: '',
    lighting: '',
    color_tone: '',
  },
  voice_anchor: {
    voice_type: '年轻男声',
    voice_style: '活泼',
    voice_speed: '正常',
    voice_pitch: '中音',
    voice_emotion: '积极励志',
  },
  visual_style: '',
  camera_style: '',
  color_theme: '',
}

// ========================================
// 提示词模板
// ========================================

export const PROMPT_TEMPLATES = {
  // 锚点提取提示词
  extractAnchor: (userInput: string) => `任务：从用户一句话中提取标准化视频创作元数据，严格遵循【全局一致性强制约束】，输出JSON格式，无多余内容。

【全局一致性强制约束·永久生效】
1. 角色一致性：全程固定角色外貌、服饰、肤色、发型、身高比例，禁止变形、换装、变脸。
2. 场景一致性：固定场景空间、陈设、光影、色调，禁止场景突变、物品凭空增减。
3. 风格一致性：固定艺术风格、分辨率、帧率、色彩方案，全程统一运镜逻辑。
4. 叙事一致性：严格围绕核心主题，无支线、无偏离、无无关内容。
5. 禁止行为：禁止自由创作、禁止风格漂移、禁止新增未定义元素、禁止改变情绪基调。

用户输入：${userInput}

输出字段：
- core_topic：核心主题（10字内）
- emotion：情绪风格
- video_duration：建议时长（15/30/60s）
- main_character：角色（身份+外貌+服饰+核心动作）
- main_scene：场景（地点+环境+光影+主色调）
- visual_style：视觉风格
- camera_style：运镜风格
- color_theme：主色调

仅输出JSON，无其他内容。`,

  // 剧本生成提示词
  generateScript: (anchor: AnchorTemplate) => `基于以下【全局一致性锚点】创作完整短视频剧本，严格遵守约束，不新增元素、不改变设定：

【全局一致性锚点】
- core_topic: ${anchor.core_topic}
- emotion: ${anchor.emotion}
- video_duration: ${anchor.video_duration}
- main_character: ${anchor.main_character.identity}，${anchor.main_character.appearance}，${anchor.main_character.clothing}，${anchor.main_character.habitual_action}
- main_scene: ${anchor.main_scene.location}，${anchor.main_scene.environment}，${anchor.main_scene.lighting}，${anchor.main_scene.color_tone}
- visual_style: ${anchor.visual_style}
- camera_style: ${anchor.camera_style}
- color_theme: ${anchor.color_theme}

剧本要求：
1. 总时长${anchor.video_duration.replace('s', '秒')}，节奏紧凑
2. 包含：开场→发展→结尾，逻辑闭环
3. 含台词/旁白、音效提示、动作描述
4. 文风活泼，适合目标受众
5. 全程不偏离主题，不新增角色/场景`,

  // 视频生成提示词（含语音）
  generateVideoWithVoice: (params: {
    visual: string
    character: string
    scene: string
    cameraStyle: string
    colorTheme: string
    dialogue: string
    voiceType: string
    voiceStyle: string
    voiceEmotion: string
    mainCharacter: string
    mainScene: string
    voiceAnchor: string
  }) => `【视频生成·含语音提示】

视觉部分：
- 画面内容：${params.visual}
- 角色动作：${params.character}
- 场景环境：${params.scene}
- 运镜方式：${params.cameraStyle}
- 色调风格：${params.colorTheme}

声音部分：
- 台词内容："${params.dialogue}"
- 声音类型：${params.voiceType}
- 声音风格：${params.voiceStyle}
- 声音情绪：${params.voiceEmotion}

一致性约束：
- 角色：${params.mainCharacter}（固定不变）
- 场景：${params.mainScene}（固定不变）
- 声音：${params.voiceAnchor}（全程统一）`,
}

// ========================================
// 视频模型参数
// ========================================

export const VIDEO_CONFIG = {
  model: 'wan2.6-i2v',
  resolution: '1080P',
  frameRate: 24,
  coherence_strength: 'maximum',
  style_similarity: 'highest_priority',
  randomness: 'low',
  fidelity_priority: 'character_scene_consistency',
}

// ========================================
// 图像模型参数
// ========================================

export const IMAGE_CONFIG = {
  model: 'wanx2.1-t2i-plus',
  resolution: '1080P',
  aspectRatio: '9:16',
  style: 'cinematic',
}
