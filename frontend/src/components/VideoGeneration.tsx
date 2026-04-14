import { Button, Modal, message, Steps } from 'antd'
import { UserOutlined, VideoCameraOutlined, ExportOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { api } from '../api'

interface VideoGenerationProps {
  projectId: string
  hasScripts: boolean
  onRefresh: () => void
}

export default function VideoGeneration({
  projectId,
  hasScripts,
  onRefresh,
}: VideoGenerationProps) {
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [modalVisible, setModalVisible] = useState(false)

  // 步骤1: 提取角色特征
  const extractCharacterFeatures = async () => {
    setLoading(true)
    setCurrentStep(0)
    
    try {
      const response = await api.post('/characters/extract-features', { projectId })
      
      if (response.data.success) {
        message.success(`成功提取 ${response.data.data.characters.length} 个角色特征`)
        setCurrentStep(1)
        onRefresh()
      } else {
        message.error(response.data.error || '提取失败')
      }
    } catch (error: any) {
      message.error(error.response?.data?.error || '提取失败')
    } finally {
      setLoading(false)
    }
  }

  // 步骤2: 批量生成视频
  const batchGenerateVideos = async () => {
    setLoading(true)
    setCurrentStep(1)
    
    try {
      message.loading({ content: '批量生成视频中，请耐心等待...', duration: 0 })
      
      const response = await api.post('/videos/batch-generate', {
        projectId,
        options: { duration: 5, quality: 'standard' },
      })
      
      if (response.data.success) {
        const { success, failed, total } = response.data.data
        message.destroy()
        message.success(`视频生成完成：成功 ${success}/${total}，失败 ${failed}`)
        setCurrentStep(2)
        onRefresh()
      } else {
        message.destroy()
        message.error(response.data.error || '生成失败')
      }
    } catch (error: any) {
      message.destroy()
      message.error(error.response?.data?.error || '生成失败')
    } finally {
      setLoading(false)
    }
  }

  // 步骤3: 合成并导出视频
  const composeAndExport = async () => {
    setLoading(true)
    setCurrentStep(2)
    
    try {
      message.loading({ content: '正在合成视频...', duration: 0 })
      
      const response = await api.post('/videos/export', { projectId })
      
      if (response.data.success) {
        message.destroy()
        message.success('视频导出成功！')
        
        // 触发下载
        const link = document.createElement('a')
        link.href = `data:${response.data.data.mimeType};base64,${response.data.data.videoBase64}`
        link.download = `video_${projectId}.mp4`
        link.click()
        
        setCurrentStep(3)
      } else {
        message.destroy()
        message.error(response.data.error || '导出失败')
      }
    } catch (error: any) {
      message.destroy()
      message.error(error.response?.data?.error || '导出失败')
    } finally {
      setLoading(false)
    }
  }

  // 一键完成所有步骤
  const handleFullProcess = async () => {
    setModalVisible(true)
    
    // 步骤1
    await extractCharacterFeatures()
    if (loading) return // 如果失败，loading会是true
    
    // 步骤2
    await batchGenerateVideos()
    if (loading) return
    
    // 步骤3
    await composeAndExport()
  }

  return (
    <>
      <Button
        type="primary"
        icon={<VideoCameraOutlined />}
        onClick={handleFullProcess}
        loading={loading}
        disabled={!hasScripts}
      >
        🎬 一键生成视频
      </Button>

      <Modal
        title="视频生成流程"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Steps
          current={currentStep}
          items={[
            {
              title: '提取角色特征',
              description: '分析剧本，提取角色外貌和特征',
              icon: <UserOutlined />,
            },
            {
              title: '批量生成视频',
              description: '为每个分镜生成视频片段',
              icon: <VideoCameraOutlined />,
            },
            {
              title: '合成导出',
              description: '合成所有片段并导出最终视频',
              icon: <ExportOutlined />,
            },
          ]}
        />

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          {currentStep === 3 ? (
            <Button type="primary" onClick={() => setModalVisible(false)}>
              完成
            </Button>
          ) : (
            <Button loading={loading}>
              {currentStep === 0 && '正在提取角色特征...'}
              {currentStep === 1 && '正在生成视频...'}
              {currentStep === 2 && '正在合成导出...'}
            </Button>
          )}
        </div>
      </Modal>
    </>
  )
}