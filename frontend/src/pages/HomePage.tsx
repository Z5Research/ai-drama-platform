import { Card, Typography, Row, Col, Statistic, Button, Space, Layout } from 'antd'
import {
  FolderOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  RocketOutlined,
  StarOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'

const { Title, Paragraph, Text } = Typography
const { Header, Content } = Layout

export default function HomePage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: '#fff', 
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 24, marginRight: 8 }}>🎬</div>
          <Title level={4} style={{ margin: 0 }}>智午AI漫剧</Title>
        </div>
        <Space size="middle">
          {isAuthenticated ? (
            <Button type="primary" onClick={() => navigate('/dashboard')}>
              进入工作台
            </Button>
          ) : (
            <>
              <Link to="/login">
                <Button>登录</Button>
              </Link>
              <Link to="/register">
                <Button type="primary">注册</Button>
              </Link>
            </>
          )}
        </Space>
      </Header>
      
      <Content style={{ background: '#f5f5f5' }}>
        <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Hero Section */}
      <Card
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          marginBottom: 24,
          border: 'none',
          borderRadius: 16,
          overflow: 'hidden',
        }}
        bodyStyle={{ padding: 48 }}
      >
        <Row gutter={48} align="middle">
          <Col xs={24} lg={14}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Text style={{ 
                  color: 'rgba(255,255,255,0.9)', 
                  fontSize: 14,
                  background: 'rgba(255,255,255,0.2)',
                  padding: '4px 12px',
                  borderRadius: 20,
                }}>
                  🎬 AI驱动的影视创作平台
                </Text>
              </div>
              
              <Title level={1} style={{ color: '#fff', margin: 0, fontSize: 42 }}>
                一句话创作动漫
                <br />
                AI 助力你的创意实现
              </Title>
              
              <Paragraph style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, margin: 0 }}>
                从文本到视频，AI 驱动的影视革命。支持剧本创作、角色管理、分镜设计、
                视频生成全流程自动化。
              </Paragraph>
              
              <Space size="middle">
                <Button
                  type="primary"
                  size="large"
                  icon={<RocketOutlined />}
                  onClick={() => navigate('/projects')}
                  style={{ 
                    height: 48, 
                    paddingLeft: 32, 
                    paddingRight: 32,
                    borderRadius: 8,
                  }}
                >
                  开始创作
                </Button>
                <Button
                  size="large"
                  ghost
                  style={{ 
                    height: 48, 
                    color: '#fff',
                    borderColor: 'rgba(255,255,255,0.5)',
                    borderRadius: 8,
                  }}
                  onClick={() => navigate('/templates')}
                >
                  查看模板
                </Button>
              </Space>
            </Space>
          </Col>
          
          <Col xs={24} lg={10} style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: 120, 
              opacity: 0.3,
              filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))',
            }}>
              🎥
            </div>
          </Col>
        </Row>
      </Card>

      {/* Stats Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} lg={6}>
          <Card 
            hoverable
            style={{ borderRadius: 12, border: 'none' }}
          >
            <Statistic
              title={<span style={{ color: '#666' }}>我的项目</span>}
              value={0}
              prefix={<FolderOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card 
            hoverable
            style={{ borderRadius: 12, border: 'none' }}
          >
            <Statistic
              title={<span style={{ color: '#666' }}>剧本数量</span>}
              value={0}
              prefix={<FileTextOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card 
            hoverable
            style={{ borderRadius: 12, border: 'none' }}
          >
            <Statistic
              title={<span style={{ color: '#666' }}>视频数量</span>}
              value={0}
              prefix={<VideoCameraOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card 
            hoverable
            style={{ borderRadius: 12, border: 'none' }}
          >
            <Statistic
              title={<span style={{ color: '#666' }}>剩余积分</span>}
              value={100}
              suffix="分"
              prefix={<StarOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ fontWeight: 600 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card 
        title={
          <span style={{ fontSize: 18, fontWeight: 600 }}>
            <ThunderboltOutlined style={{ marginRight: 8, color: '#faad14' }} />
            快速开始
          </span>
        }
        style={{ borderRadius: 12, border: 'none' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={8}>
            <Card
              hoverable
              style={{ 
                textAlign: 'center', 
                borderRadius: 12,
                border: '2px solid transparent',
                transition: 'all 0.3s',
              }}
              bodyStyle={{ padding: 32 }}
              onClick={() => navigate('/projects/new')}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#1677ff';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ 
                width: 80, 
                height: 80, 
                background: 'linear-gradient(135deg, #1677ff 0%, #69b1ff 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <FolderOutlined style={{ fontSize: 36, color: '#fff' }} />
              </div>
              <Title level={4} style={{ marginTop: 16, marginBottom: 8 }}>
                创建项目
              </Title>
              <Paragraph type="secondary" style={{ margin: 0 }}>
                开始你的第一个AI动漫项目
              </Paragraph>
            </Card>
          </Col>
          
          <Col xs={24} lg={8}>
            <Card
              hoverable
              style={{ 
                textAlign: 'center', 
                borderRadius: 12,
                border: '2px solid transparent',
                transition: 'all 0.3s',
              }}
              bodyStyle={{ padding: 32 }}
            >
              <div style={{ 
                width: 80, 
                height: 80, 
                background: 'linear-gradient(135deg, #52c41a 0%, #95de64 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <FileTextOutlined style={{ fontSize: 36, color: '#fff' }} />
              </div>
              <Title level={4} style={{ marginTop: 16, marginBottom: 8 }}>
                生成剧本
              </Title>
              <Paragraph type="secondary" style={{ margin: 0 }}>
                AI 智能创作剧本内容
              </Paragraph>
            </Card>
          </Col>
          
          <Col xs={24} lg={8}>
            <Card
              hoverable
              style={{ 
                textAlign: 'center', 
                borderRadius: 12,
                border: '2px solid transparent',
                transition: 'all 0.3s',
              }}
              bodyStyle={{ padding: 32 }}
            >
              <div style={{ 
                width: 80, 
                height: 80, 
                background: 'linear-gradient(135deg, #722ed1 0%, #b37feb 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <VideoCameraOutlined style={{ fontSize: 36, color: '#fff' }} />
              </div>
              <Title level={4} style={{ marginTop: 16, marginBottom: 8 }}>
                制作视频
              </Title>
              <Paragraph type="secondary" style={{ margin: 0 }}>
                一键生成动漫视频
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </Card>
        </div>
      </Content>
    </Layout>
  )
}
