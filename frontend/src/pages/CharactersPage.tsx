import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, Row, Col, Button, Modal, Form, Input, Select, Upload, Empty, Spin } from 'antd'
import { PlusOutlined, UserOutlined, UploadOutlined } from '@ant-design/icons'
import { api } from '../api'

interface Character {
  id: string
  name: string
  description: string
  gender: string
  age: string
  appearance: string
  personality: string
  imageUrl?: string
  createdAt: string
}

export default function CharactersPage() {
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { data: characters, isLoading } = useQuery({
    queryKey: ['characters'],
    queryFn: () => api.get('/characters').then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/characters', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] })
      setModalVisible(false)
      form.resetFields()
    },
  })

  const handleCreate = async (values: any) => {
    await createMutation.mutateAsync(values)
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>角色库</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          创建角色
        </Button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" />
        </div>
      ) : !characters?.length ? (
        <Empty description="暂无角色，点击上方按钮创建" />
      ) : (
        <Row gutter={[16, 16]}>
          {characters.map((char: Character) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={char.id}>
              <Card
                hoverable
                cover={
                  char.imageUrl ? (
                    <img alt={char.name} src={char.imageUrl} style={{ height: 200, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
                      <UserOutlined style={{ fontSize: 48, color: '#ccc' }} />
                    </div>
                  )
                }
              >
                <Card.Meta
                  title={char.name}
                  description={
                    <>
                      <div style={{ marginBottom: 8 }}>{char.description}</div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ fontSize: 12, color: '#999' }}>{char.gender}</span>
                        <span style={{ fontSize: 12, color: '#999' }}>{char.age}岁</span>
                      </div>
                    </>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title="创建角色"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="角色名称" rules={[{ required: true }]}>
                <Input placeholder="输入角色名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="gender" label="性别">
                <Select placeholder="选择性别">
                  <Select.Option value="male">男</Select.Option>
                  <Select.Option value="female">女</Select.Option>
                  <Select.Option value="other">其他</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="角色描述">
            <Input.TextArea rows={3} placeholder="描述这个角色的背景故事" />
          </Form.Item>

          <Form.Item name="appearance" label="外貌特征">
            <Input.TextArea rows={2} placeholder="描述角色的外貌特征" />
          </Form.Item>

          <Form.Item name="personality" label="性格特点">
            <Input.TextArea rows={2} placeholder="描述角色的性格特点" />
          </Form.Item>

          <Form.Item name="imageUrl" label="角色形象图">
            <Upload listType="picture" maxCount={1}>
              <Button icon={<UploadOutlined />}>上传图片</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
