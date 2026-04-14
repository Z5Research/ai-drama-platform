import { useQuery } from '@tanstack/react-query'
import { Card, Row, Col, Statistic, Progress } from 'antd'
import {
  UserOutlined,
  ProjectOutlined,
  VideoCameraOutlined,
  DollarOutlined,
} from '@ant-design/icons'
import { api } from '../../api'

export default function StatsTab() {
  const { data: stats } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.get('/admin/stats').then(r => r.data),
  })

  const statCards = [
    {
      title: '用户总数',
      value: stats?.totalUsers || 0,
      icon: <UserOutlined />,
      color: '#1677ff',
    },
    {
      title: '项目总数',
      value: stats?.totalProjects || 0,
      icon: <ProjectOutlined />,
      color: '#52c41a',
    },
    {
      title: '生成视频',
      value: stats?.totalVideos || 0,
      icon: <VideoCameraOutlined />,
      color: '#722ed1',
    },
    {
      title: '总收入',
      value: stats?.totalRevenue || 0,
      prefix: '¥',
      icon: <DollarOutlined />,
      color: '#faad14',
    },
  ]

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statCards.map((stat, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={
                  <span style={{ color: stat.color, marginRight: 8 }}>
                    {stat.icon}
                  </span>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="系统资源">
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>CPU 使用率</span>
                <span>{stats?.cpuUsage || 0}%</span>
              </div>
              <Progress percent={stats?.cpuUsage || 0} showInfo={false} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>内存使用率</span>
                <span>{stats?.memoryUsage || 0}%</span>
              </div>
              <Progress percent={stats?.memoryUsage || 0} showInfo={false} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>磁盘使用率</span>
                <span>{stats?.diskUsage || 0}%</span>
              </div>
              <Progress percent={stats?.diskUsage || 0} showInfo={false} />
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="今日活动">
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>新增用户</span>
                <span>{stats?.todayNewUsers || 0}</span>
              </div>
              <Progress percent={Math.min((stats?.todayNewUsers || 0) / 10 * 100, 100)} showInfo={false} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>新建项目</span>
                <span>{stats?.todayNewProjects || 0}</span>
              </div>
              <Progress percent={Math.min((stats?.todayNewProjects || 0) / 50 * 100, 100)} showInfo={false} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>生成任务</span>
                <span>{stats?.todayGenerations || 0}</span>
              </div>
              <Progress percent={Math.min((stats?.todayGenerations || 0) / 100 * 100, 100)} showInfo={false} />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
