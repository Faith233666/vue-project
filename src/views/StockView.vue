<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { getText, get } from '../api/axios'
import { ElDialog, ElButton, ElTag, ElSkeleton } from 'element-plus'

interface StockData {
  name: string
  code: string
  rawCode: string
  price: number
  change: number
  changePercent: number
  open: number
  high: number
  low: number
  volume: string
}

interface ReportItem {
  title: string
  stockName: string
  stockCode: string
  orgSName: string
  publishDate: string
  infoCode: string
  emRatingName: string
  researcher: string
}

const stocks = ref<StockData[]>([])
const firstLoading = ref(true)
const reportDialogVisible = ref(false)
const reportsLoading = ref(false)
const currentStock = ref<StockData | null>(null)
const reportsList = ref<ReportItem[]>([])

const stockList = [
  { name: '亨通光电', code: 'sh600487', rawCode: '600487' },
  { name: '赣锋锂业', code: 'sz002460', rawCode: '002460' },
  { name: '中际旭创', code: 'sz300308', rawCode: '300308' }
]

let timer: ReturnType<typeof setInterval> | null = null

const fetchStockData = async () => {
  try {
    const codes = stockList.map(s => s.code).join(',')
    const url = `/gtimg/q=${codes}`
    const text = await getText(url)
    
    const stockDataList: StockData[] = []
    const lines = text.split('\n').filter(line => line.trim())
    
    lines.forEach((line) => {
      const match = line.match(/v_(\w+)="(.+)"/)
      if (!match || !match[2]) return
      
      const fullCode = match[1] ?? ''
      const rawCode = fullCode.replace(/^(sh|sz|bj)/, '')
      const data = match[2].split('~')
      if (data.length < 35) return
      
      const price = parseFloat(data[3] ?? '0')
      const change = parseFloat(data[31] ?? '0')
      const changePercent = parseFloat(data[32] ?? '0')
      
      stockDataList.push({
        name: data[1] ?? '',
        code: fullCode,
        rawCode,
        price,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        open: parseFloat(data[5] ?? '0'),
        high: parseFloat(data[33] ?? '0'),
        low: parseFloat(data[34] ?? '0'),
        volume: formatVolume(parseFloat(data[6] ?? '0')),
      })
    })
    
    stocks.value = stockDataList
    firstLoading.value = false
  } catch (error) {
    console.error('获取股票数据失败:', error)
    firstLoading.value = false
  }
}

const formatVolume = (volume: number): string => {
  if (volume >= 100000000) {
    return (volume / 100000000).toFixed(2) + '亿'
  } else if (volume >= 10000) {
    return (volume / 10000).toFixed(2) + '万'
  }
  return volume.toString()
}

const fetchReports = async (stock: StockData) => {
  currentStock.value = stock
  reportDialogVisible.value = true
  reportsLoading.value = true
  reportsList.value = []
  
  try {
    const url = `/eastmoney_report/report/list?pageSize=10&pageNo=1&beginTime=2020-01-01&endTime=2026-12-31&qType=0&code=${stock.rawCode}`
    const res: any = await get(url)
    if (res && res.data) {
      reportsList.value = res.data
    }
  } catch (error) {
    console.error('获取研报数据失败:', error)
  } finally {
    reportsLoading.value = false
  }
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return ''
  return dateStr.split(' ')[0] || dateStr
}

const getRatingTagType = (rating: string): 'danger' | 'warning' | 'info' | 'success' | 'primary' => {
  if (!rating) return 'primary'
  if (rating.includes('买入') || rating.includes('强推')) return 'danger'
  if (rating.includes('增持') || rating.includes('推荐')) return 'warning'
  if (rating.includes('中性')) return 'info'
  return 'primary'
}

const openReportDetail = (infoCode: string) => {
  if (!infoCode) return
  window.open(`https://data.eastmoney.com/report/info/${infoCode}.html`, '_blank')
}

onMounted(() => {
  fetchStockData()
  timer = setInterval(fetchStockData, 5000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<template>
  <div class="stock-container">
    <header class="stock-header">
      <h1 class="title">📈 股票实时行情与核心研报</h1>
      <p class="subtitle">实时刷新行情数据 · 点击卡片或按钮查看最新10条机构研报</p>
    </header>

    <div v-if="firstLoading" class="loading">
      <el-skeleton :rows="5" animated />
      <p>正在加载实时行情...</p>
    </div>

    <div v-else class="stock-grid">
      <div
        v-for="stock in stocks"
        :key="stock.code"
        class="stock-card"
        @click="fetchReports(stock)"
      >
        <div class="stock-header-info">
          <div class="name-box">
            <span class="stock-name">{{ stock.name }}</span>
            <span class="stock-code">{{ stock.code.toUpperCase() }}</span>
          </div>
          <ElButton
            type="primary"
            size="small"
            class="report-btn"
            @click.stop="fetchReports(stock)"
          >
            📋 查看研报
          </ElButton>
        </div>
        
        <div class="stock-price-section">
          <span class="price" :class="{ 'price-up': stock.change >= 0, 'price-down': stock.change < 0 }">
            {{ stock.price.toFixed(2) }}
          </span>
          <span class="change" :class="{ 'change-up': stock.change >= 0, 'change-down': stock.change < 0 }">
            {{ stock.change >= 0 ? '+' : '' }}{{ stock.change.toFixed(2) }}
            ({{ stock.changePercent >= 0 ? '+' : '' }}{{ stock.changePercent.toFixed(2) }}%)
          </span>
        </div>
        
        <div class="stock-details">
          <div class="detail-item">
            <span class="label">今开</span>
            <span class="value">{{ stock.open.toFixed(2) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">最高</span>
            <span class="value high">{{ stock.high.toFixed(2) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">最低</span>
            <span class="value low">{{ stock.low.toFixed(2) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">成交量</span>
            <span class="value">{{ stock.volume }}</span>
          </div>
        </div>

        <div class="card-footer-tip">
          <span>点击卡片或右上方按钮查看研报 ➔</span>
        </div>
      </div>
    </div>

    <!-- 研报 Modal 弹窗 -->
    <ElDialog
      v-model="reportDialogVisible"
      :title="`${currentStock?.name || ''} (${currentStock?.code.toUpperCase() || ''}) - 最新 10 条研究报告`"
      width="780px"
      class="report-dialog"
      destroy-on-close
    >
      <div v-if="reportsLoading" class="dialog-loading">
        <el-skeleton :rows="6" animated />
      </div>

      <div v-else-if="reportsList.length === 0" class="empty-reports">
        <p>暂无相关研报数据</p>
      </div>

      <div v-else class="report-list">
        <div
          v-for="(item, index) in reportsList"
          :key="item.infoCode || index"
          class="report-item"
          @click="openReportDetail(item.infoCode)"
        >
          <div class="report-header">
            <span class="report-index">{{ index + 1 }}</span>
            <h4 class="report-title">{{ item.title }}</h4>
          </div>

          <div class="report-meta">
            <div class="meta-left">
              <span class="org-name">🏦 {{ item.orgSName || '权威机构' }}</span>
              <span v-if="item.researcher" class="author">👤 {{ item.researcher }}</span>
              <ElTag
                v-if="item.emRatingName"
                :type="getRatingTagType(item.emRatingName)"
                size="small"
                effect="dark"
                class="rating-tag"
              >
                {{ item.emRatingName }}
              </ElTag>
            </div>
            <div class="meta-right">
              <span class="publish-date">📅 {{ formatDate(item.publishDate) }}</span>
              <span class="link-icon">🔗 查看原文</span>
            </div>
          </div>
        </div>
      </div>
    </ElDialog>
  </div>
</template>

<style scoped>
.stock-container {
  width: 100%;
  min-height: 100vh;
  padding: 40px 20px;
  background: #0f0c29 url('/images/bg.jpg') no-repeat;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  position: relative;
}

.stock-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(15, 12, 41, 0.75) 0%, rgba(48, 43, 99, 0.75) 50%, rgba(36, 36, 62, 0.8) 100%);
  backdrop-filter: blur(8px);
}

.stock-header {
  text-align: center;
  margin-bottom: 45px;
  position: relative;
  z-index: 1;
  animation: fadeInDown 0.8s ease-out;
}

.title {
  font-size: 40px;
  color: #fff;
  margin: 0;
  font-weight: 800;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(186, 133, 255, 0.5);
  letter-spacing: 3px;
}

.subtitle {
  color: rgba(255, 255, 255, 0.85);
  font-size: 16px;
  margin-top: 14px;
  font-weight: 400;
  letter-spacing: 1px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  color: #fff;
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
}

.stock-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 30px;
  max-width: 1240px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.stock-card {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.18);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.stock-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 150%;
  height: 150%;
  background: radial-gradient(circle at 80% 20%, rgba(186, 133, 255, 0.25) 0%, transparent 60%);
  pointer-events: none;
}

.stock-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(186, 133, 255, 0.5);
  background: rgba(255, 255, 255, 0.18);
}

.stock-header-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 22px;
  position: relative;
  z-index: 1;
}

.name-box {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stock-name {
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
}

.stock-code {
  font-size: 13px;
  color: #00d4ff;
  background: rgba(0, 212, 255, 0.2);
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  border: 1px solid rgba(0, 212, 255, 0.4);
}

.report-btn {
  border-radius: 20px;
  font-weight: 600;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  border: none;
  box-shadow: 0 4px 14px rgba(37, 117, 252, 0.4);
  transition: all 0.3s ease;
}

.report-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(37, 117, 252, 0.6);
}

.stock-price-section {
  text-align: center;
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
}

.price {
  font-size: 56px;
  font-weight: 900;
  color: #fff;
  text-shadow: 3px 3px 8px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
}

.price-up {
  color: #ff4757;
  text-shadow: 0 0 35px rgba(255, 71, 87, 0.7);
}

.price-down {
  color: #2ed573;
  text-shadow: 0 0 35px rgba(46, 213, 115, 0.7);
}

.change {
  display: block;
  font-size: 22px;
  margin-top: 8px;
  font-weight: 700;
}

.change-up {
  color: #ff4757;
}

.change-down {
  color: #2ed573;
}

.stock-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  position: relative;
  z-index: 1;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  transition: all 0.3s ease;
}

.detail-item:hover {
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(186, 133, 255, 0.4);
}

.label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.value {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
}

.value.high {
  color: #ff80a0;
}

.value.low {
  color: #60d8c0;
}

.card-footer-tip {
  margin-top: 18px;
  text-align: right;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  transition: color 0.3s ease;
}

.stock-card:hover .card-footer-tip {
  color: rgba(255, 255, 255, 0.9);
}

/* 研报 Dialog 样式 */
:deep(.report-dialog) {
  border-radius: 20px;
  background: #181925;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

:deep(.report-dialog .el-dialog__title) {
  color: #fff;
  font-weight: 700;
  font-size: 20px;
}

:deep(.report-dialog .el-dialog__header) {
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.report-dialog .el-dialog__body) {
  max-height: 65vh;
  overflow-y: auto;
  padding: 20px;
}

.dialog-loading, .empty-reports {
  padding: 30px 10px;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
}

.report-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.report-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 14px;
  padding: 16px 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
}

.report-item:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(186, 133, 255, 0.4);
  transform: translateX(4px);
}

.report-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 10px;
}

.report-index {
  background: rgba(37, 117, 252, 0.3);
  color: #00d4ff;
  font-weight: 700;
  font-size: 13px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.report-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  line-height: 1.4;
}

.report-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
  margin-top: 10px;
}

.meta-left {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.meta-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.link-icon {
  color: #00d4ff;
  font-weight: 600;
  transition: opacity 0.3s ease;
}

.report-item:hover .link-icon {
  text-decoration: underline;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>