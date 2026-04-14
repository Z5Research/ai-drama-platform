import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Button, Space, Tag, Descriptions, Tabs, Modal, Form, Input, Select, message, Progress, Empty } from 'antd'
import { EditOutlined, PlayCircleOutlined, FileTextOutlined, TeamOutlined, AudioOutlined, VideoCameraOutlined, RobotOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { api } from '../api'
import StoryboardEditor from '../components/StoryboardEditor'
import VideoGeneration from '../components/VideoGeneration'

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('scripts')
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [form] = Form.useForm()

  // 获取项目数据
  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => api.get(`/projects/${id}`).then(r => r.data),
  })

  // 生成剧本
  const generateMutation = useMutation({
    mutationFn: (values: any) => api.post('/agents/generate', { projectId: id, ...values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] })
      message.success('剧本生成成功')
      setShowGenerateModal(false)
      form.resetFields()
    },
    onError: (error: any) => {
      message.error(error.response?.data?.error || '生成失败')
    },
  })

  const handleGenerate = async (values: any) => {
    try {
      await generateMutation.mutateAsync(values)
      // 双重保障：确保Modal关闭
      setShowGenerateModal(false)
    } catch (error) {
      message.error('生成失败，请重试')
    }
  }

  if (isLoading) return <div style={{ textAlign: 'center', padding: 100 }}>加载中...</div>
  if (!project?.data) return <Empty description="项目不存在" />

  const currentProject = project.data
  
  // 展平分镜面板数据
  const panels = currentProject.episodes?.flatMap((episode: any) => 
    episode.clips?.flatMap((clip: any) => 
      clip.storyboard?.panels || []
    ) || []
  ) || []

  const stages = [
    { key: 'script', label: '剧本', icon: <FileTextOutlined />, progress: currentProject.scripts?.length ? 100 : 0 },
    { key: 'storyboard', label: '分镜', icon: <VideoCameraOutlined />, progress: 60 },
    { key: 'characters', label: '角色', icon: <TeamOutlined />, progress: 80 },
    { key: 'voice', label: '配音', icon: <AudioOutlined />, progress: 30 },
    { key: 'render', label: '渲染', icon: <VideoCameraOutlined />, progress: 0 },
  ]

  const tabItems = [
    {
      key: 'scripts',
      label: `剧本 (${currentProject.scripts?.length || 0})`,
      children: (
        <div style={{ padding: 24 }}>
          {currentProject.scripts?.length === 0 ? (
            <Empty description="还没有剧本，点击上方按钮生成" />
          ) : (
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {currentProject.scripts?.map((script: any) => (
                <Card key={script.id} hoverable>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <h3 style={{ margin: 0 }}>{script.title}</h3>
                    {script.isAiGenerated && <Tag color="blue">AI生成</Tag>}
                  </div>
                  <p style={{ color: '#666', marginBottom: 12 }}>
                    {script.content?.substring(0, 200)}...
                  </p>
                  <div style={{ fontSize: 12, color: '#999' }}>
                    消耗 {script.creditsCost} 积分 · {new Date(script.createdAt).toLocaleDateString()}
                  </div>
                </Card>
              ))}
            </Space>
          )}
        </div>
      ),
    },
    {
      key: 'storyboard',
      label: '分镜编辑',
      children: (
        <div style={{ padding: 24 }}>
          <StoryboardEditor 
            panels={panels}
            onRefresh={() => queryClient.invalidateQueries({ queryKey: ['project', id] })}
          />
        </div>
      ),
    },
    {
      key: 'characters',
      label: `角色 (${currentProject.characters?.length || 0})`,
      children: (
        <div style={{ padding: 24 }}>
          {currentProject.characters?.length === 0 ? (
            <Empty description="角色将随剧本自动生成" />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
              {currentProject.characters?.map((char: any) => (
                <Card key={char.id} hoverable>
                  <div style={{ marginBottom: 12 }}>
                    <h3 style={{ margin: 0 }}>{char.name}</h3>
                  </div>
                  <p style={{ color: '#666', fontSize: 13, marginBottom: 12 }}>
                    {char.description || '暂无描述'}
                  </p>
                  {char.traits && (
                    <div style={{ fontSize: 12, color: '#999' }}>
                      特征: {char.traits}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'settings',
      label: '项目设置',
      children: (
        <div style={{ padding: 24 }}>
          <Descriptions column={2} bordered>
            <Descriptions.Item label="项目名称">{currentProject.title}</Descriptions.Item>
            <Descriptions.Item label="项目类型"><Tag>{currentProject.type}</Tag></Descriptions.Item>
            <Descriptions.Item label="画面比例">{currentProject.aspectRatio}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{new Date(currentProject.createdAt).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="项目简介" span={2}>{currentProject.description || '暂无'}</Descriptions.Item>
          </Descriptions>
        </div>
      ),
    },
  ]

  return (
    <div>
      {/* 头部 */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0 }}>{currentProject.title}</h1>
          <Space style={{ marginTop: 8 }}>
            <Tag color="blue">{currentProject.type || '短剧'}</Tag>
            <Tag>{currentProject.genre || '都市'}</Tag>
            <span style={{ color: '#999' }}>{currentProject.aspectRatio}</span>
          </Space>
        </div>
        <Space>
          <Button icon={<PlayCircleOutlined />}>预览</Button>
          <Button icon={<EditOutlined />}>编辑</Button>
          <Button 
            type="primary" 
            icon={<RobotOutlined />}
            onClick={() => setShowGenerateModal(true)}
            loading={generateMutation.isPending}
          >
            ✨ AI 生成剧本
          </Button>
          <VideoGeneration
            projectId={id || ''}
            hasScripts={(currentProject.scripts?.length || 0) > 0}
            onRefresh={() => queryClient.invalidateQueries({ queryKey: ['project', id] })}
          />
        </Space>
      </div>

      {/* 进度条 */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {stages.map(stage => (
            <div key={stage.key} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{stage.icon}</div>
              <div style={{ marginBottom: 8 }}>{stage.label}</div>
              <Progress percent={stage.progress} size="small" showInfo={false} />
              <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{stage.progress}%</div>
            </div>
          ))}
        </div>
      </Card>

      {/* 标签页 */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>

      {/* 生成剧本对话框 */}
      <Modal
        title="AI 生成剧本"
        open={showGenerateModal}
        onCancel={() => setShowGenerateModal(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleGenerate} initialValues={{ model: 'glm-5' }}>
          <Form.Item
            name="prompt"
            label="创意描述"
            rules={[{ required: true, message: '请输入创意描述' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="描述你想创作的剧本内容，例如：一个关于AI觉醒的故事..."
            />
          </Form.Item>

          <Form.Item name="genre" label="类型">
            <Select placeholder="选择类型">
              <Select.Option value="剧情">剧情</Select.Option>
              <Select.Option value="喜剧">喜剧</Select.Option>
              <Select.Option value="悬疑">悬疑</Select.Option>
              <Select.Option value="科幻">科幻</Select.Option>
              <Select.Option value="爱情">爱情</Select.Option>
              <Select.Option value="动作">动作</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="style" label="风格">
            <Select placeholder="选择风格">
              <Select.Option value="电影">电影</Select.Option>
              <Select.Option value="电视剧">电视剧</Select.Option>
              <Select.Option value="动漫">动漫</Select.Option>
              <Select.Option value="纪录片">纪录片</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="model" label="AI模型">
            <Select>
              <Select.Option value="glm-5">GLM-5 (推荐)</Select.Option>
              <Select.Option value="gpt-4">GPT-4</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setShowGenerateModal(false)}>取消</Button>
              <Button type="primary" htmlType="submit" loading={generateMutation.isPending}>
                开始生成
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}