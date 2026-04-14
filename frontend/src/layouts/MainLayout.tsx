import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import Sider from '../components/Sider'

const { Content } = Layout

export default function MainLayout() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider />
      <Layout>
        <Header />
        <Content style={{ 
          margin: 0,
          padding: 24,
          background: '#f5f5f5',
          minHeight: 'calc(100vh - 64px)'
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
