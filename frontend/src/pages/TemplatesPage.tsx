import { useQuery } from '@tanstack/react-query'
import { Card, Row, Col, Tag, Button, Input, Select, Empty, Spin } from 'antd'
import { SearchOutlined, StarOutlined, DownloadOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { api } from '../api'

const { Search } = Input

export default function TemplatesPage() {
  const [category, setCategory] = useState<string>()
  const [searchText, setSearchText] = useState('')

  const { data: templates, isLoading } = useQuery({
    queryKey: ['templates', category, searchText],
    queryFn: () => api.get('/templates', { params: { category, search: searchText } }).then(r => r.data),
  })

  const categories = [
    { label: '全部', value: undefined },
    { label: '都市', value: 'urban' },
    { label: '古风', value: 'ancient' },
    { label: '科幻', value: 'scifi' },
    { label: '悬疑', value: 'suspense' },
    { label: '爱情', value: 'romance' },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, marginBottom: 16 }}>模板市场</h1>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Search
            placeholder="搜索模板"
            allowClear
            style={{ maxWidth: 300 }}
            onSearch={setSearchText}
            prefix={<SearchOutlined />}
          />
          <Select
            placeholder="选择分类"
            style={{ width: 120 }}
            options={categories}
            onChange={setCategory}
            allowClear
          />
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" />
        </div>
      ) : !templates?.length ? (
        <Empty description="暂无模板" />
      ) : (
        <Row gutter={[16, 16]}>
          {templates.map((template: any) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={template.id}>
              <Card
                hoverable
                cover={
                  <div style={{ height: 160, overflow: 'hidden', position: 'relative' }}>
                    {template.coverImage ? (
                      <img
                        alt={template.name}
                        src={template.coverImage}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: '#fff',
                        fontSize: 48
                      }}>
                        📦
                      </div>
                    )}
                    {template.isPremium && (
                      <Tag color="gold" style={{ position: 'absolute', top: 8, right: 8 }}>
                        <StarOutlined /> VIP
                      </Tag>
                    )}
                  </div>
                }
                actions={[
                  <Button key="preview" type="link" size="small">预览</Button>,
                  <Button key="use" type="primary" size="small" icon={<DownloadOutlined />}>
                    使用
                  </Button>,
                ]}
              >
                <Card.Meta
                  title={template.name}
                  description={
                    <>
                      <div style={{ marginBottom: 8, color: '#666' }}>
                        {template.description}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Tag>{template.category}</Tag>
                        <span style={{ fontSize: 12, color: '#999' }}>
                          {template.useCount || 0} 次使用
                        </span>
                      </div>
                    </>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  )
}
