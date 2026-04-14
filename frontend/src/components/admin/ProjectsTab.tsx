import { useQuery } from '@tanstack/react-query'
import { Table, Tag, Button, Space, Progress, Popconfirm } from 'antd'
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import { api } from '../../api'

export default function ProjectsTab() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['admin', 'projects'],
    queryFn: () => api.get('/admin/projects').then(r => r.data),
  })

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '创建者',
      dataIndex: ['user', 'name'],
      key: 'userName',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag>{type || '短剧'}</Tag>,
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => (
        <Progress percent={progress || 0} size="small" style={{ width: 100 }} />
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          active: 'green',
          archived: 'default',
          deleted: 'red',
        }
        return <Tag color={colors[status] || 'default'}>{status || 'active'}</Tag>
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, _record: any) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />}>
            查看
          </Button>
          <Popconfirm title="确定删除此项目？">
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      dataSource={projects || []}
      rowKey="id"
      loading={isLoading}
    />
  )
}
