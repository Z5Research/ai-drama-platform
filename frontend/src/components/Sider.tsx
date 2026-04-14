import { Layout, Menu } from 'antd'
import {
  FolderOutlined,
  DashboardOutlined,
  UserOutlined,
  AppstoreOutlined,
  ExportOutlined,
  CrownOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'

const { Sider: AntSider } = Layout

const menuItems = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: '工作台',
  },
  {
    key: '/projects',
    icon: <FolderOutlined />,
    label: '项目管理',
  },
  {
    key: '/characters',
    icon: <UserOutlined />,
    label: '角色库',
  },
  {
    key: '/templates',
    icon: <AppstoreOutlined />,
    label: '模板市场',
  },
  {
    key: '/export',
    icon: <ExportOutlined />,
    label: '导出中心',
  },
  {
    key: '/credits',
    icon: <CrownOutlined />,
    label: '积分充值',
  },
  {
    key: '/admin',
    icon: <SettingOutlined />,
    label: '后台管理',
  },
]

export default function Sider() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  // 匹配当前路径或子路径
  const selectedKey = menuItems.find(item => 
    location.pathname === item.key || location.pathname.startsWith(item.key + '/')
  )?.key || '/dashboard'

  return (
    <AntSider
      width={200}
      style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}
      theme="light"
    >
      <div style={{ 
        height: 64, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <h2 style={{ margin: 0, color: '#1677ff' }}>🎬 智午AI漫剧</h2>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ height: 'calc(100% - 64px)', borderRight: 0 }}
      />
    </AntSider>
  )
}
