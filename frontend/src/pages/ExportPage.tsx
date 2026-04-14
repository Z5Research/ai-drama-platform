import { useQuery } from '@tanstack/react-query'
import { Card, Table, Button, Tag, Space, Tabs, Empty } from 'antd'
import { DownloadOutlined, EyeOutlined, DeleteOutlined, VideoCameraOutlined, PictureOutlined, FileTextOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { api } from '../api'

export default function ExportPage() {
  const [activeTab, setActiveTab] = useState('videos')

  const { data: exports, isLoading } = useQuery({
    queryKey: ['exports', activeTab],
    queryFn: () => api.get(`/exports?type=${activeTab}`).then(r => r.data),
  })

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const icons: Record<string, any> = {
          video: <VideoCameraOutlined />,
          image: <PictureOutlined />,
          script: <FileTextOutlined />,
        }
        return <Tag icon={icons[type]}>{type}</Tag>
      },
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      render: (size: number) => `${(size / 1024 / 1024).toFixed(2)} MB`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          completed: 'success',
          processing: 'processing',
          failed: 'error',
        }
        return <Tag color={colors[status]}>{status}</Tag>
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, _record: any) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />}>预览</Button>
          <Button type="link" size="small" icon={<DownloadOutlined />}>下载</Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
        </Space>
      ),
    },
  ]

  const tabItems = [
    {
      key: 'videos',
      label: (
        <span>
          <VideoCameraOutlined />
          视频
        </span>
      ),
    },
    {
      key: 'images',
      label: (
        <span>
          <PictureOutlined />
          图片
        </span>
      ),
    },
    {
      key: 'scripts',
      label: (
        <span>
          <FileTextOutlined />
          剧本
        </span>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>导出中心</h1>
        <p style={{ color: '#666', marginTop: 8 }}>管理您生成的所有媒体资源</p>
      </div>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

        <Table
          columns={columns}
          dataSource={exports || []}
          rowKey="id"
          loading={isLoading}
          locale={{ emptyText: <Empty description="暂无导出内容" /> }}
        />
      </Card>
    </div>
  )
}
