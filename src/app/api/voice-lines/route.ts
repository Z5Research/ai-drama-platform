import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { rateLimitMiddleware } from '@/lib/middleware'

// GET /api/voice-lines - 获取台词列表
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    const { searchParams } = new URL(request.url)
    const episodeId = searchParams.get('episodeId')
    const speakersOnly = searchParams.get('speakersOnly')

    if (!episodeId) {
      return NextResponse.json({ error: '需要 episodeId 参数' }, { status: 400 })
    }

    // 权限验证
    const episode = await prisma.episode.findFirst({
      where: { id: episodeId },
      include: { project: { select: { userId: true } } }
    })

    if (!episode || episode.project?.userId !== user.id) {
      return NextResponse.json({ error: '无权访问' }, { status: 403 })
    }

    if (speakersOnly) {
      const speakers = await prisma.voiceLine.findMany({
        where: { episodeId },
        select: { speaker: true },
        distinct: ['speaker'],
      })
      return NextResponse.json({ speakers: speakers.map(s => s.speaker) })
    }

    const voiceLines = await prisma.voiceLine.findMany({
      where: { episodeId },
      orderBy: { lineIndex: 'asc' },
    })

    return NextResponse.json({ voiceLines })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }
    console.error('获取台词列表失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// POST /api/voice-lines - 创建台词
export async function POST(request: NextRequest) {
  const rateLimitResponse = rateLimitMiddleware(request, 'ai')
  if (rateLimitResponse) return rateLimitResponse

  try {
    const user = await requireAuth()

    const body = await request.json()
    const { episodeId, lines } = body

    if (!episodeId || !lines || !Array.isArray(lines)) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    // 权限验证
    const episode = await prisma.episode.findFirst({
      where: { id: episodeId },
      include: { project: { select: { userId: true } } }
    })

    if (!episode || episode.project?.userId !== user.id) {
      return NextResponse.json({ error: '无权操作' }, { status: 403 })
    }

    // 批量创建
    const voiceLines = await prisma.voiceLine.createMany({
      data: lines.map((line: Record<string, unknown>, index: number) => ({
        episodeId,
        lineIndex: index,
        speaker: line.speaker as string,
        content: line.content as string,
        voiceId: line.voiceId as string | undefined,
        voiceType: line.voiceType as string | undefined,
        emotionPrompt: line.emotionPrompt as string | undefined,
        emotionStrength: line.emotionStrength as number | undefined,
      })),
    })

    return NextResponse.json({ success: true, count: voiceLines.count }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }
    console.error('创建台词失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// PUT /api/voice-lines - 更新台词
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth()

    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: '缺少台词ID' }, { status: 400 })
    }

    // 权限验证
    const voiceLine = await prisma.voiceLine.findUnique({
      where: { id },
      include: { episode: { include: { project: { select: { userId: true } } } } }
    })

    if (!voiceLine || voiceLine.episode?.project?.userId !== user.id) {
      return NextResponse.json({ error: '无权操作' }, { status: 403 })
    }

    const updated = await prisma.voiceLine.update({
      where: { id },
      data: {
        speaker: data.speaker,
        content: data.content,
        voiceId: data.voiceId,
        voiceType: data.voiceType,
        emotionPrompt: data.emotionPrompt,
        emotionStrength: data.emotionStrength,
      },
    })

    return NextResponse.json({ voiceLine: updated })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }
    console.error('更新台词失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// DELETE /api/voice-lines - 删除台词
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: '缺少台词ID' }, { status: 400 })
    }

    // 权限验证
    const voiceLine = await prisma.voiceLine.findUnique({
      where: { id },
      include: { episode: { include: { project: { select: { userId: true } } } } }
    })

    if (!voiceLine || voiceLine.episode?.project?.userId !== user.id) {
      return NextResponse.json({ error: '无权操作' }, { status: 403 })
    }

    await prisma.voiceLine.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }
    console.error('删除台词失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}