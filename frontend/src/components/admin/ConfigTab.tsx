import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Form, Input, Button, Card, message, Spin, Switch, InputNumber } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import { api } from '../../api'

export default function ConfigTab() {
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { data: config, isLoading } = useQuery({
    queryKey: ['admin', 'config'],
    queryFn: () => api.get('/admin/config').then(r => r.data),
  })

  // 当数据加载完成时，设置表单值
  if (config && !form.getFieldValue('siteName')) {
    form.setFieldsValue(config)
  }

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.put('/admin/config', data),
    onSuccess: () => {
      message.success('配置已保存')
      queryClient.invalidateQueries({ queryKey: ['admin', 'config'] })
    },
    onError: () => {
      message.error('保存失败')
    },
  })

  const handleSave = async (values: any) => {
    await updateMutation.mutateAsync(values)
  }

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 800 }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={config}
      >
        <Card title="基本设置" style={{ marginBottom: 16 }}>
          <Form.Item name="siteName" label="站点名称">
            <Input placeholder="智午AI漫剧" />
          </Form.Item>
          <Form.Item name="siteDescription" label="站点描述">
            <Input.TextArea rows={3} placeholder="AI驱动的漫剧视频创作平台" />
          </Form.Item>
          <Form.Item name="allowRegistration" label="开放注册" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="defaultUserCredits" label="新用户默认积分">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Card>

        <Card title="AI服务配置" style={{ marginBottom: 16 }}>
          <Form.Item name="openaiApiKey" label="OpenAI API Key">
            <Input.Password placeholder="sk-..." />
          </Form.Item>
          <Form.Item name="openaiModel" label="默认模型">
            <Input placeholder="gpt-4" />
          </Form.Item>
          <Form.Item name="imageModel" label="图像生成模型">
            <Input placeholder="dall-e-3" />
          </Form.Item>
          <Form.Item name="videoModel" label="视频生成模型">
            <Input placeholder="runway-gen2" />
          </Form.Item>
        </Card>

        <Card title="存储配置" style={{ marginBottom: 16 }}>
          <Form.Item name="storageType" label="存储类型">
            <Input placeholder="local / s3 / oss" />
          </Form.Item>
          <Form.Item name="maxFileSize" label="最大文件大小 (MB)">
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Card>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={updateMutation.isPending}
            size="large"
          >
            保存配置
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
