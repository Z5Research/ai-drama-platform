import { useQuery } from '@tanstack/react-query'
import { Card, Row, Col, Button, Statistic, Table, Tag, Space, Modal, Radio } from 'antd'
import { CrownOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useAuthStore } from '../stores/auth'

const packages = [
  { credits: 100, price: 9.9, popular: false },
  { credits: 500, price: 39.9, popular: true },
  { credits: 1000, price: 69.9, popular: false },
  { credits: 5000, price: 299, popular: false },
]

export default function CreditsPage() {
  const [selectedPackage, setSelectedPackage] = useState(1)
  const [payModalVisible, setPayModalVisible] = useState(false)
  const { user } = useAuthStore()

  const { data: transactions } = useQuery({
    queryKey: ['credits', 'transactions'],
    queryFn: () => fetch('/api/credits/transactions').then(r => r.json()),
  })

  const transactionColumns = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'purchase' ? 'green' : 'blue'}>
          {type === 'purchase' ? '充值' : '消费'}
        </Tag>
      ),
    },
    {
      title: '积分',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: any) => (
        <span style={{ color: record.type === 'purchase' ? '#52c41a' : '#ff4d4f' }}>
          {record.type === 'purchase' ? '+' : '-'}{amount}
        </span>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>积分中心</h1>
        <p style={{ color: '#666', marginTop: 8 }}>管理您的积分账户</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="当前积分"
              value={user?.credits || 0}
              prefix={<CrownOutlined style={{ color: '#faad14' }} />}
              suffix="积分"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="本月消费"
              value={1234}
              prefix={<ThunderboltOutlined style={{ color: '#1677ff' }} />}
              suffix="积分"
            />
          </Card>
        </Col>
      </Row>

      <Card title="充值套餐" style={{ marginTop: 16 }}>
        <Row gutter={[16, 16]}>
          {packages.map((pkg, index) => (
            <Col xs={12} sm={6} key={index}>
              <Card
                hoverable
                style={{
                  borderColor: selectedPackage === index ? '#1677ff' : undefined,
                  position: 'relative',
                }}
                onClick={() => setSelectedPackage(index)}
              >
                {pkg.popular && (
                  <Tag color="gold" style={{ position: 'absolute', top: 8, right: 8 }}>
                    <CrownOutlined /> 推荐
                  </Tag>
                )}
                <div style={{ textAlign: 'center' }}>
                  <CrownOutlined style={{ fontSize: 32, color: '#faad14', marginBottom: 8 }} />
                  <div style={{ fontSize: 24, fontWeight: 'bold' }}>{pkg.credits}</div>
                  <div style={{ color: '#999' }}>积分</div>
                  <div style={{ fontSize: 20, marginTop: 8, color: '#1677ff' }}>
                    ¥{pkg.price}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Button type="primary" size="large" onClick={() => setPayModalVisible(true)}>
            立即充值
          </Button>
        </div>
      </Card>

      <Card title="交易记录" style={{ marginTop: 16 }}>
        <Table
          columns={transactionColumns}
          dataSource={transactions || []}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="确认支付"
        open={payModalVisible}
        onCancel={() => setPayModalVisible(false)}
        onOk={() => {
          // TODO: 实现支付逻辑
          setPayModalVisible(false)
        }}
      >
        <div style={{ textAlign: 'center', padding: 24 }}>
          <CrownOutlined style={{ fontSize: 48, color: '#faad14' }} />
          <div style={{ fontSize: 24, marginTop: 16 }}>
            {packages[selectedPackage].credits} 积分
          </div>
          <div style={{ fontSize: 32, marginTop: 8, color: '#1677ff', fontWeight: 'bold' }}>
            ¥{packages[selectedPackage].price}
          </div>
        </div>
        <Radio.Group defaultValue="alipay" style={{ width: '100%' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Radio value="alipay" style={{ width: '100%' }}>支付宝</Radio>
            <Radio value="wechat" style={{ width: '100%' }}>微信支付</Radio>
          </Space>
        </Radio.Group>
      </Modal>
    </div>
  )
}
