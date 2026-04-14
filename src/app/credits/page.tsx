'use client'

// 积分中心页面
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUserStore, usePaymentStore } from '@/stores'
import { CreditPackage, CreditLog } from '@/types'

export default function CreditsPage() {
  const router = useRouter()
  const { user, updateCredits } = useUserStore()
  const { selectedPackage, setSelectedPackage, paymentMethod, setPaymentMethod } = usePaymentStore()
  const [loading, setLoading] = useState(true)
  const [packages, setPackages] = useState<CreditPackage[]>([])
  const [logs, setLogs] = useState<CreditLog[]>([])
  const [stats, setStats] = useState<any>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'packages' | 'logs'>('packages')
  
  useEffect(() => {
    fetchData()
  }, [])
  
  const fetchData = async () => {
    try {
      const [packagesRes, statsRes, logsRes] = await Promise.all([
        fetch('/api/credits/packages'),
        fetch('/api/credits/stats'),
        fetch('/api/credits/logs?pageSize=20'),
      ])
      
      const packagesData = await packagesRes.json()
      const statsData = await statsRes.json()
      const logsData = await logsRes.json()
      
      if (packagesData.success) setPackages(packagesData.data)
      if (statsData.success) setStats(statsData.data)
      if (logsData.success) setLogs(logsData.data)
    } catch (err) {
      console.error('Fetch data error:', err)
    } finally {
      setLoading(false)
    }
  }
  
  const handleSelectPackage = (pkg: CreditPackage) => {
    setSelectedPackage(pkg)
    setShowPaymentModal(true)
  }
  
  const handlePayment = async () => {
    if (!selectedPackage) return
    
    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedPackage.price,
          paymentMethod,
          packageId: selectedPackage.id,
        }),
      })
      
      const data = await res.json()
      
      if (data.success) {
        // 这里应该跳转到支付页面或显示二维码
        alert(`订单创建成功！订单号：${data.data.orderNo}`)
        setShowPaymentModal(false)
        // TODO: 显示支付二维码
      }
    } catch (err) {
      console.error('Payment error:', err)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <nav className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              ← 返回
            </Link>
            <span className="mx-4 text-gray-300">|</span>
            <h1 className="font-semibold">积分中心</h1>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 积分概览 */}
        <div className="card mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">{user?.credits || 0}</div>
              <div className="text-gray-600">当前余额</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats?.totalRecharged || 0}</div>
              <div className="text-gray-600">累计充值</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{stats?.totalConsumed || 0}</div>
              <div className="text-gray-600">累计消费</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{stats?.totalGift || 0}</div>
              <div className="text-gray-600">累计赠送</div>
            </div>
          </div>
        </div>
        
        {/* 标签页 */}
        <div className="border-b mb-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('packages')}
              className={`py-4 border-b-2 font-medium ${
                activeTab === 'packages'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600'
              }`}
            >
              充值套餐
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`py-4 border-b-2 font-medium ${
                activeTab === 'logs'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600'
              }`}
            >
              消费明细
            </button>
          </div>
        </div>
        
        {/* 套餐列表 */}
        {activeTab === 'packages' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg, index) => (
              <div
                key={pkg.id}
                className={`card relative ${
                  index === 2 ? 'ring-2 ring-indigo-600' : ''
                }`}
              >
                {index === 2 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm">
                    推荐
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">¥{pkg.price}</span>
                </div>
                <div className="space-y-2 mb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">基础积分</span>
                    <span>{pkg.credits}</span>
                  </div>
                  {pkg.bonus > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>赠送积分</span>
                      <span>+{pkg.bonus}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold pt-2 border-t">
                    <span>总计</span>
                    <span>{pkg.credits + pkg.bonus} 积分</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>有效期</span>
                    <span>{pkg.validity} 天</span>
                  </div>
                </div>
                <button
                  onClick={() => handleSelectPackage(pkg)}
                  className="btn-gradient w-full"
                >
                  立即购买
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* 消费明细 */}
        {activeTab === 'logs' && (
          <div className="card">
            <div className="space-y-4">
              {logs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  暂无记录
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex justify-between items-center py-4 border-b last:border-0"
                  >
                    <div>
                      <div className="font-medium">
                        {log.type === 'recharge' && '充值'}
                        {log.type === 'consume' && '消费'}
                        {log.type === 'gift' && '赠送'}
                        {log.type === 'refund' && '退款'}
                        {log.type === 'expire' && '过期'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {log.description || new Date(log.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className={`text-lg font-semibold ${
                      log.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {log.amount > 0 ? '+' : ''}{log.amount}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
      
      {/* 支付弹窗 */}
      {showPaymentModal && selectedPackage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 animate-fadeIn">
            <h3 className="text-xl font-bold mb-6">确认支付</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">套餐</span>
                <span>{selectedPackage.name}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">积分</span>
                <span>{selectedPackage.credits + selectedPackage.bonus}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>支付金额</span>
                <span className="text-indigo-600">¥{selectedPackage.price}</span>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                支付方式
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod('wechat')}
                  className={`p-4 border rounded-lg flex items-center justify-center space-x-2 ${
                    paymentMethod === 'wechat' ? 'border-indigo-600 bg-indigo-50' : ''
                  }`}
                >
                  <span>💚</span>
                  <span>微信支付</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('alipay')}
                  className={`p-4 border rounded-lg flex items-center justify-center space-x-2 ${
                    paymentMethod === 'alipay' ? 'border-indigo-600 bg-indigo-50' : ''
                  }`}
                >
                  <span>💙</span>
                  <span>支付宝</span>
                </button>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handlePayment}
                className="flex-1 btn-gradient"
              >
                确认支付
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
