'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import {
  Shield,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Users,
  Zap,
  Clock,
  Download,
  ChevronRight,
  Check,
  ArrowUpRight,
  Activity,
  Lock,
  FileText,
  Globe,
  Server,
  Wallet,
  Target,
} from 'lucide-react'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
}

// Mock data for enterprise dashboard
const dashboardData = {
  sentinel: {
    name: 'Enterprise-AI-Sentinel-01',
    model: 'GPT-4o',
    provider: 'Anthropic',
    uptime: '99.99%',
    status: 'live',
    deploymentDate: '2024-12-15',
  },
  stats: {
    totalAttacks: 45_892,
    attacksChange: '+12.5%',
    resilienceScore: 96,
    scoreChange: '+3.2%',
    uniqueAttackers: 2_847,
    attackersChange: '+8.1%',
    totalEarnings: 18_450,
    earningsChange: '+24.3%',
  },
  vulnerabilities: [
    {
      id: 1,
      name: 'Multi-turn Context Manipulation',
      severity: 'Critical',
      type: 'Social Engineering',
      status: 'Pending',
      discovered: '2 hours ago',
      attacker: '0x7a2...f4e1',
    },
    {
      id: 2,
      name: 'Base64 Encoded Injection',
      severity: 'High',
      type: 'Prompt Injection',
      status: 'Reviewing',
      discovered: '5 hours ago',
      attacker: '0x3f9...a2b8',
    },
    {
      id: 3,
      name: 'Roleplay Scenario Bypass',
      severity: 'High',
      type: 'Jailbreaking',
      status: 'Patched',
      discovered: '1 day ago',
      attacker: '0x2b1...c9d4',
    },
    {
      id: 4,
      name: 'Recursive Output Expansion',
      severity: 'Medium',
      type: 'Resource Exhaustion',
      status: 'Patched',
      discovered: '2 days ago',
      attacker: '0x9e4...f7a2',
    },
  ],
  attackDistribution: [
    { type: 'Prompt Injection', percentage: 38, color: '#F445AB' },
    { type: 'Jailbreaking', percentage: 28, color: '#C871FF' },
    { type: 'Data Extraction', percentage: 18, color: '#10B981' },
    { type: 'Social Engineering', percentage: 10, color: '#3B82F6' },
    { type: 'Other', percentage: 6, color: '#F59E0B' },
  ],
  recentActivity: [
    { type: 'attack', message: 'New attack attempt blocked', time: '2 min ago', icon: Shield },
    {
      type: 'vulnerability',
      message: 'Critical vulnerability discovered',
      time: '15 min ago',
      icon: AlertTriangle,
    },
    { type: 'patch', message: 'Security patch deployed', time: '1 hour ago', icon: Check },
    {
      type: 'attack',
      message: '25 attack attempts in last hour',
      time: '1 hour ago',
      icon: Activity,
    },
  ],
}

// Helper components
const SeverityBadge = ({ severity }: { severity: string }) => {
  const styles = {
    Critical: 'bg-red-50 text-red-600 border-red-100',
    High: 'bg-orange-50 text-orange-600 border-orange-100',
    Medium: 'bg-blue-50 text-blue-600 border-blue-100',
    Low: 'bg-gray-50 text-gray-600 border-gray-100',
  }
  return (
    <span
      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
        styles[severity as keyof typeof styles]
      }`}
    >
      {severity.toUpperCase()}
    </span>
  )
}

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    Pending: 'text-amber-600',
    Reviewing: 'text-blue-600',
    Patched: 'text-emerald-600',
  }
  const dotColors = {
    Pending: 'bg-amber-500',
    Reviewing: 'bg-blue-500',
    Patched: 'bg-emerald-500',
  }
  return (
    <span
      className={`flex items-center gap-1.5 text-sm font-medium ${styles[status as keyof typeof styles]}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${dotColors[status as keyof typeof dotColors]} animate-pulse`}
      />
      {status}
    </span>
  )
}

// Sparkline component
const Sparkline = ({ data, color = '#F445AB' }: { data: number[]; color?: string }) => {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const width = 80
  const height = 32
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((val - min) / range) * height * 0.8 - 3
    return `${x},${y}`
  })

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path
        d={`M${points.join(' L')}`}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Stat Card Component
const StatCard = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  sparklineData,
}: {
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: React.ElementType
  sparklineData?: number[]
}) => (
  <motion.div
    variants={itemVariants}
    className="relative bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300 group"
  >
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 bg-gray-50 rounded-xl group-hover:bg-[#F445AB]/5 transition-colors border border-gray-100">
          <Icon className="w-5 h-5 text-[#F445AB]" />
        </div>
        {sparklineData && <Sparkline data={sparklineData} />}
      </div>

      <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{value}</h3>

      <div
        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
          changeType === 'positive'
            ? 'bg-emerald-50 text-emerald-600'
            : changeType === 'negative'
              ? 'bg-red-50 text-red-600'
              : 'bg-gray-50 text-gray-500'
        }`}
      >
        {changeType === 'positive' && <TrendingUp className="w-3 h-3" />}
        {change}
      </div>
    </div>
  </motion.div>
)

// Attack Distribution Chart
const AttackDistributionChart = () => {
  const total = dashboardData.attackDistribution.reduce((acc, item) => acc + item.percentage, 0)
  let currentAngle = 0
  const segments = dashboardData.attackDistribution.map((item) => {
    const startAngle = currentAngle
    const endAngle = currentAngle + (item.percentage / total) * 360
    currentAngle = endAngle
    return { ...item, startAngle, endAngle }
  })

  return (
    <div className="flex items-center justify-center">
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {/* Background circle */}
          <circle cx="50" cy="50" r="38" fill="none" stroke="#f3f4f6" strokeWidth="10" />
          {segments.map((segment, i) => (
            <circle
              key={i}
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke={segment.color}
              strokeWidth="10"
              strokeDasharray={`${(segment.percentage / 100) * 238.8} 238.8`}
              strokeDashoffset={
                -segments.slice(0, i).reduce((acc, s) => acc + (s.percentage / 100) * 238.8, 0)
              }
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">2.8k</span>
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">Attacks</span>
        </div>
      </div>
    </div>
  )
}

// Main Dashboard Component
export function AdvancedDashboard({ showNavbar = true }: { showNavbar?: boolean }) {
  const [timeRange, setTimeRange] = useState('7D')
  const timeRanges = ['24H', '7D', '30D', '90D']

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-gray-900 font-sans">
      {/* Enterprise Dashboard Navbar - Can be hidden in preview mode */}
      {showNavbar && (
        <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <Image
                    src="/icons/logo/logo_dark.png"
                    alt="Sui Sentinel"
                    width={140}
                    height={32}
                    className="h-7 w-auto"
                  />
                  <span className="hidden sm:inline text-gray-300">|</span>
                  <span className="hidden sm:inline text-gray-500 text-sm font-medium tracking-wide">
                    ENTERPRISE
                  </span>
                </div>
                <div className="hidden md:flex items-center gap-1 ml-8">
                  {['Dashboard', 'Sentinels', 'Analytics', 'Reports', 'Settings'].map((item, i) => (
                    <button
                      key={item}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                        i === 0
                          ? 'text-gray-900 bg-gray-100'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 hover:border-[#F445AB]/30 hover:bg-white transition-all group">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                  <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">
                    0x84...c92a
                  </span>
                </button>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F445AB] to-[#C871FF] flex items-center justify-center text-sm font-bold text-white">
                  JD
                </div>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Header Section */}
          <motion.header
            variants={itemVariants}
            className="flex flex-col lg:flex-row lg:items-center justify-between gap-6"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-2xl font-bold text-gray-900">{dashboardData.sentinel.name}</h1>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-[#C871FF]" />
                  <span>
                    Model:{' '}
                    <span className="text-gray-900 font-medium">
                      {dashboardData.sentinel.model}
                    </span>
                  </span>
                </div>
                <div className="w-px h-4 bg-gray-300 hidden sm:block" />
                <div className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-[#C871FF]" />
                  <span>
                    Provider:{' '}
                    <span className="text-gray-900 font-medium">
                      {dashboardData.sentinel.provider}
                    </span>
                  </span>
                </div>
                <div className="w-px h-4 bg-gray-300 hidden sm:block" />
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#C871FF]" />
                  <span>
                    Uptime:{' '}
                    <span className="text-gray-900 font-medium">
                      {dashboardData.sentinel.uptime}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl transition-all shadow-sm">
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">Audit Log</span>
              </button>
              <button className="flex items-center gap-2 bg-gradient-to-r from-[#F445AB] to-[#C871FF] hover:opacity-90 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-[#F445AB]/25 transition-all">
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Export</span>
              </button>
            </div>
          </motion.header>

          {/* Stats Grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <StatCard
              title="Attacks Blocked"
              value={dashboardData.stats.totalAttacks.toLocaleString()}
              change={dashboardData.stats.attacksChange}
              changeType="positive"
              icon={ShieldCheck}
              sparklineData={[40, 60, 30, 80, 50, 75, 65, 90, 70, 85]}
            />
            <StatCard
              title="Resilience Score"
              value={`${dashboardData.stats.resilienceScore}%`}
              change={dashboardData.stats.scoreChange}
              changeType="positive"
              icon={Activity}
              sparklineData={[85, 87, 88, 86, 89, 91, 92, 94, 95, 96]}
            />
            <StatCard
              title="Unique Attackers"
              value={dashboardData.stats.uniqueAttackers.toLocaleString()}
              change={dashboardData.stats.attackersChange}
              changeType="positive"
              icon={Users}
              sparklineData={[20, 35, 45, 40, 55, 60, 70, 65, 80, 85]}
            />
            <StatCard
              title="Total Earnings"
              value={`${dashboardData.stats.totalEarnings.toLocaleString()} SUI`}
              change={dashboardData.stats.earningsChange}
              changeType="positive"
              icon={Wallet}
              sparklineData={[100, 120, 110, 140, 160, 150, 180, 200, 190, 220]}
            />
          </motion.div>

          {/* Charts Row */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Target className="w-5 h-5 text-[#F445AB]" />
                    Attack Volume & Resilience
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Red-team penetration success monitoring
                  </p>
                </div>
                <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                  {timeRanges.map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                        timeRange === range
                          ? 'bg-white text-[#F445AB] shadow-sm border border-gray-200'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-[260px] relative">
                {/* Chart Background Grid */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-full h-px bg-gray-100" />
                  ))}
                </div>
                {/* Chart Area */}
                <svg
                  className="absolute inset-0 w-full h-full"
                  preserveAspectRatio="none"
                  viewBox="0 0 900 280"
                >
                  <defs>
                    <linearGradient id="chartGradientLight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F445AB" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#F445AB" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="lineGradientLight" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#F445AB" />
                      <stop offset="100%" stopColor="#C871FF" />
                    </linearGradient>
                  </defs>
                  {/* Area fill */}
                  <path
                    d="M0,220 C100,200 200,240 300,150 C400,60 500,120 600,80 C700,50 800,180 900,120 L900,280 L0,280 Z"
                    fill="url(#chartGradientLight)"
                  />
                  {/* Main line */}
                  <path
                    d="M0,220 C100,200 200,240 300,150 C400,60 500,120 600,80 C700,50 800,180 900,120"
                    fill="none"
                    stroke="url(#lineGradientLight)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {/* Secondary line */}
                  <path
                    d="M0,260 C150,230 300,200 450,220 C600,240 750,140 900,100"
                    fill="none"
                    stroke="#C871FF"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    opacity="0.4"
                  />
                </svg>
                {/* X-axis labels */}
                <div className="absolute bottom-0 w-full flex justify-between text-xs text-gray-400 px-2">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>
              <div className="flex items-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#F445AB] to-[#C871FF]" />
                  <span className="text-gray-500">Attacks Blocked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#C871FF]/50" />
                  <span className="text-gray-500">Resilience Score</span>
                </div>
              </div>
            </div>

            {/* Attack Distribution */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#C871FF]" />
                Attack Types
              </h2>
              <AttackDistributionChart />
              <div className="space-y-2.5 mt-6">
                {dashboardData.attackDistribution.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm group">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-gray-600 group-hover:text-gray-900 transition-colors">
                        {item.type}
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Vulnerabilities & Activity Row */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Vulnerabilities Table */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Vulnerabilities
                </h2>
                <button className="text-sm text-[#C871FF] hover:text-[#F445AB] transition-colors flex items-center gap-1">
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                      <th className="font-medium py-3 px-2">Vulnerability</th>
                      <th className="font-medium py-3 px-2">Severity</th>
                      <th className="font-medium py-3 px-2">Type</th>
                      <th className="font-medium py-3 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {dashboardData.vulnerabilities.map((vuln) => (
                      <tr
                        key={vuln.id}
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
                      >
                        <td className="py-4 px-2 font-medium text-gray-900 group-hover:text-[#F445AB] transition-colors">
                          <div className="flex items-center gap-2">
                            {vuln.name}
                            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <SeverityBadge severity={vuln.severity} />
                        </td>
                        <td className="py-4 px-2 text-gray-500">{vuln.type}</td>
                        <td className="py-4 px-2">
                          <StatusBadge status={vuln.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Activity & Rewards */}
            <div className="space-y-6">
              {/* Activity Feed */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#C871FF]" />
                  Live Activity
                </h2>
                <div className="space-y-4">
                  {dashboardData.recentActivity.map((activity, i) => (
                    <div key={i} className="flex items-start gap-3 group">
                      <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-[#F445AB]/5 transition-colors border border-gray-100">
                        <activity.icon className="w-4 h-4 text-[#C871FF]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                          {activity.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rewards Card */}
              <div className="relative bg-gradient-to-br from-[#F445AB]/5 via-[#C871FF]/5 to-white rounded-2xl p-6 border border-[#F445AB]/10 overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Rewards Pool</h2>
                      <p className="text-xs text-gray-500">Current epoch</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#F445AB] to-[#C871FF]">
                        24.5k
                      </div>
                      <div className="text-xs text-gray-500">SENTINEL</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-gray-600">Distribution</span>
                      <span className="text-gray-400">2d 14h</span>
                    </div>
                    <div className="w-full h-2 rounded-full flex overflow-hidden bg-gray-100">
                      <div className="w-[45%] bg-[#F445AB]" />
                      <div className="w-[40%] bg-[#C871FF]" />
                      <div className="w-[15%] bg-gray-300" />
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] text-gray-500">
                      <span>Defenders 45%</span>
                      <span>Attackers 40%</span>
                      <span>DAO 15%</span>
                    </div>
                  </div>

                  <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#F445AB] to-[#C871FF] text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-[#F445AB]/20">
                    Claim Rewards
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Enterprise Banner */}
          <motion.div
            variants={itemVariants}
            className="relative bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-100 overflow-hidden"
          >
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F445AB] to-[#C871FF] flex items-center justify-center shadow-lg shadow-[#F445AB]/20">
                  <ShieldCheck className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Enterprise Security Suite</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    SOC 2 Type II • TEE Verification • 24/7 Support
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <div className="text-xs text-gray-500">Next Audit</div>
                  <div className="text-lg font-bold text-gray-900">June 15, 2026</div>
                </div>
                <button className="flex items-center gap-2 bg-gray-900 text-white hover:bg-gray-800 px-6 py-3 rounded-xl font-semibold transition-all">
                  Schedule Review
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}

export default AdvancedDashboard
