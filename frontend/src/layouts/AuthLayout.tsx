import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'

const { Content } = Layout

export default function AuthLayout() {
  return (
    <Layout style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <Content
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Outlet />
      </Content>
    </Layout>
  )
}