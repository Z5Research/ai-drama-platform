import { Card, Button, Space, Image, Tag, Spin } from 'antd'
import { PictureOutlined, VideoCameraOutlined, CheckOutlined } from '@ant-design/icons'

interface Panel {
  id: string
  panelNumber: number
  description: string
  imagePrompt?: string
  imageUrl?: string
  imageStatus?: string
  videoUrl?: string
  videoStatus?: string
  duration?: number
}

interface PanelCardProps {
  panel: Panel
  onGenerateImage?: () => void
  onGenerateVideo?: () => void
  generating?: boolean
  videoGenerating?: boolean
}

export default function PanelCard({ 
  panel, 
  onGenerateImage, 
  onGenerateVideo,
  generating,
  videoGenerating 
}: PanelCardProps) {
  const imageCompleted = panel.imageStatus === 'completed' && panel.imageUrl
  const videoCompleted = panel.videoStatus === 'completed' && panel.videoUrl

  return (
    <Card
      hoverable
      style={{ marginBottom: 16 }}
      cover={
        imageCompleted ? (
          <Image
            src={panel.imageUrl}
            alt={`镜头 ${panel.panelNumber}`}
            style={{ height: 200, objectFit: 'cover' }}
            placeholder={<Spin />}
          />
        ) : (
          <div style={{ 
            height: 200, 
            background: '#f5f5f5', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 8
          }}>
            <PictureOutlined style={{ fontSize: 48, color: '#ccc' }} />
            <span style={{ color: '#999' }}>镜头 {panel.panelNumber}</span>
          </div>
        )
      }
    >
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>
          镜头 #{panel.panelNumber}
        </div>
        <p style={{ color: '#666', fontSize: 13, margin: 0 }}>
          {panel.description?.substring(0, 100)}...
        </p>
      </div>

      <Space direction="vertical" style={{ width: '100%' }}>
        {/* 图像生成状态 */}
        <div>
          {imageCompleted ? (
            <Tag color="success" icon={<CheckOutlined />}>
              图像已生成
            </Tag>
          ) : generating ? (
            <Tag color="processing">
              <Spin size="small" /> 图像生成中...
            </Tag>
          ) : (
            <Button 
              size="small" 
              icon={<PictureOutlined />}
              onClick={onGenerateImage}
              block
            >
              生成图像
            </Button>
          )}
        </div>

        {/* 视频生成状态 */}
        {imageCompleted && (
          <div>
            {videoCompleted ? (
              <Tag color="success" icon={<CheckOutlined />}>
                视频已生成
              </Tag>
            ) : videoGenerating ? (
              <Tag color="processing">
                <Spin size="small" /> 视频生成中...
              </Tag>
            ) : (
              <Button 
                size="small" 
                icon={<VideoCameraOutlined />}
                onClick={onGenerateVideo}
                block
                type="primary"
              >
                生成视频
              </Button>
            )}
          </div>
        )}
      </Space>
    </Card>
  )
}