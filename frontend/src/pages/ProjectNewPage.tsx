import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Button, Form, Input, Select, Space, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

const { TextArea } = Input

export default function ProjectNewPage() {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/projects', data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      message.success('项目创建成功')
      const projectId = response.data?.data?.id || response.data?.id
      navigate(`/project/${projectId}`)
    },
    onError: () => {
      message.error('创建失败，请重试')
    },
  })

  const handleSubmit = async (values: any) => {
    await createMutation.mutateAsync(values)
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>创建新项目</h1>
        <p style={{ color: '#666', marginTop: 8 }}>开始您的AI漫剧创作之旅</p>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ type: 'short', aspectRatio: '16:9' }}
        >
          <Form.Item
            name="title"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="为您的项目起个名字" size="large" />
          </Form.Item>

          <Form.Item name="type" label="作品类型">
            <Select size="large">
              <Select.Option value="short">短剧</Select.Option>
              <Select.Option value="series">连续剧</Select.Option>
              <Select.Option value="movie">电影</Select.Option>
              <Select.Option value="commercial">广告</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="genre" label="题材类型">
            <Select size="large" placeholder="选择题材">
              <Select.Option value="urban">都市</Select.Option>
              <Select.Option value="ancient">古风</Select.Option>
              <Select.Option value="scifi">科幻</Select.Option>
              <Select.Option value="suspense">悬疑</Select.Option>
              <Select.Option value="romance">爱情</Select.Option>
              <Select.Option value="comedy">喜剧</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="aspectRatio" label="画面比例">
            <Select size="large">
              <Select.Option value="16:9">16:9 (横屏)</Select.Option>
              <Select.Option value="9:16">9:16 (竖屏)</Select.Option>
              <Select.Option value="1:1">1:1 (方形)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="description" label="项目简介">
            <TextArea
              rows={4}
              placeholder="描述您的项目内容、风格、目标受众等"
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" size="large" loading={createMutation.isPending}>
                创建项目
              </Button>
              <Button size="large" onClick={() => navigate('/projects')}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
