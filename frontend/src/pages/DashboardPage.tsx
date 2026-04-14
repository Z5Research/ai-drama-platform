import { useAuthStore } from '../stores/auth'
import { useQuery } from '@tanstack/react-query'
import { Card, Row, Col, Statistic, Button, List, Avatar, Tag } from 'antd'
import { useNavigate } from 'react-router-dom'
import {
  FolderOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  CrownOutlined,
  PlusOutlined
} from '@ant-design/icons'
import { api } from '../api'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects').then(r => r.data),
  })

  const stats = [
    { label: '项目总数', value: projects?.length || 0, icon: <FolderOutlined />, color: '#1677ff' },
    { label: '生成图片', value: 847, icon: <PictureOutlined />, color: '#52c41a' },
    { label: '生成视频', value: 156, icon: <VideoCameraOutlined />, color: '#722ed1' },
    { label: '剩余积分', value: user?.credits || 0, icon: <CrownOutlined />, color: '#faad14' },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24 }}>控制台</h1>
          <p style={{ margin: 0, color: '#666', marginTop: 4 }}>欢迎回来，{user?.name || '创作者'}</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/projects/new')}>
          新建项目
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {stats.map((stat, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card>
              <Statistic
                title={stat.label}
                value={stat.value}
                prefix={<span style={{ color: stat.color, marginRight: 8 }}>{stat.icon}</span>}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="最近项目" extra={<a onClick={() => navigate('/projects')}>查看全部</a>}>
            <List
              dataSource={projects?.slice(0, 5) || []}
              renderItem={(item: any) => (
                <List.Item
                  actions={[<a key="edit" onClick={() => navigate(`/project/${item.id}`)}>编辑</a>]}
                >
                  <List.Item.Meta
                    avatar={<Avatar style={{ backgroundColor: '#1677ff' }}>{item.name?.[0]}</Avatar>}
                    title={item.name}
                    description={
                      <>
                        <Tag color="blue">{item.stage || '分镜阶段'}</Tag>
                        <span style={{ marginLeft: 8, color: '#999' }}>
                          {new Date(item.updatedAt).toLocaleDateString()}
                        </span>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="快速操作">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Button block icon={<PlusOutlined />} onClick={() => navigate('/projects/new')}>
                新建项目
              </Button>
              <Button block icon={<FolderOutlined />} onClick={() => navigate('/characters')}>
                角色库
              </Button>
              <Button block icon={<VideoCameraOutlined />} onClick={() => navigate('/templates')}>
                模板市场
              </Button>
              <Button block icon={<CrownOutlined />} onClick={() => navigate('/credits')}>
                充值积分
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
