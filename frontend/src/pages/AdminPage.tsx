import { Card, Tabs } from 'antd'
import {
  UserOutlined,
  ProjectOutlined,
  SettingOutlined,
  BarChartOutlined,
} from '@ant-design/icons'
import UsersTab from '../components/admin/UsersTab'
import ProjectsTab from '../components/admin/ProjectsTab'
import ConfigTab from '../components/admin/ConfigTab'
import StatsTab from '../components/admin/StatsTab'

export default function AdminPage() {

  const tabItems = [
    {
      key: 'stats',
      label: (
        <span>
          <BarChartOutlined />
          数据统计
        </span>
      ),
      children: <StatsTab />,
    },
    {
      key: 'users',
      label: (
        <span>
          <UserOutlined />
          用户管理
        </span>
      ),
      children: <UsersTab />,
    },
    {
      key: 'projects',
      label: (
        <span>
          <ProjectOutlined />
          项目管理
        </span>
      ),
      children: <ProjectsTab />,
    },
    {
      key: 'config',
      label: (
        <span>
          <SettingOutlined />
          系统配置
        </span>
      ),
      children: <ConfigTab />,
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>后台管理</h1>
      </div>

      <Card>
        <Tabs items={tabItems} />
      </Card>
    </div>
  )
}
