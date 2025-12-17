"use client"

import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/dashboard/stat-card"
import { Bell, Clock, CheckCircle, Shield } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const chartData = [
  { day: "Mon", safewander: 45, national: 180 },
  { day: "Tue", safewander: 52, national: 175 },
  { day: "Wed", safewander: 38, national: 190 },
  { day: "Thu", safewander: 41, national: 185 },
  { day: "Fri", safewander: 35, national: 170 },
  { day: "Sat", safewander: 48, national: 195 },
  { day: "Sun", safewander: 42, national: 180 },
]

const recentActivity = [
  { text: "Alert resolved - Patient returned to safe zone", time: "2 mins ago", type: "success" },
  { text: "Shift Change Report submitted", time: "1 hour ago", type: "info" },
  { text: "Weekly wellness check completed", time: "3 hours ago", type: "info" },
  { text: "Perimeter alert acknowledged", time: "5 hours ago", type: "warning" },
]

export default function ImpactPage() {
  return (
    <AppShell title="Impact Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Impact Dashboard</h1>
            <p className="text-sm text-[var(--text-secondary)]">Unit A Monitoring Overview</p>
          </div>
          <Badge className="bg-[var(--accent-primary-muted)] text-[var(--status-safe)]">
            <span className="mr-1.5 h-2 w-2 animate-pulse rounded-full bg-current" />
            System Operational
          </Badge>
        </div>

        {/* Stats Row */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            icon={Bell}
            label="Total Alerts Sent"
            value={142}
            sublabel="Last 30 days"
            trend="+12% vs last month"
            trendUp={true}
          />
          <StatCard
            icon={Clock}
            label="Avg Response Time"
            value="45s"
            sublabel="Top Performance"
            trend="20% faster than avg"
            trendUp={true}
            iconClassName="bg-amber-500/15"
          />
          <StatCard
            icon={CheckCircle}
            label="Successful Recoveries"
            value="100%"
            sublabel="All time"
            iconClassName="bg-[var(--status-safe)]/15"
          />
        </div>

        {/* Chart & Activity */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Response Efficiency Chart */}
          <Card className="border-[var(--border-subtle)] bg-[var(--bg-secondary)] lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-[var(--text-primary)]">Response Efficiency</CardTitle>
                  <p className="text-sm text-[var(--text-tertiary)]">SafeWander vs National Average (seconds)</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[var(--status-safe)]" />
                    <span className="text-[var(--text-secondary)]">SafeWander</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full border-2 border-dashed border-gray-500" />
                    <span className="text-[var(--text-secondary)]">National Avg</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}s`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a242d",
                        border: "1px solid rgba(148, 163, 184, 0.2)",
                        borderRadius: "8px",
                        color: "#f1f5f9",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="safewander"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: "#10b981", strokeWidth: 2 }}
                      name="SafeWander"
                    />
                    <Line
                      type="monotone"
                      dataKey="national"
                      stroke="#6b7280"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="National Avg"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg text-[var(--text-primary)]">Recent Activity</CardTitle>
              <Button variant="link" className="h-auto p-0 text-[var(--accent-primary)]">
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      activity.type === "success"
                        ? "bg-[var(--status-safe)]"
                        : activity.type === "warning"
                          ? "bg-[var(--status-warning)]"
                          : "bg-[var(--accent-secondary)]"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm text-[var(--text-primary)]">{activity.text}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">{activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-6 py-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-[var(--accent-primary)]" />
            <span className="text-sm text-[var(--text-secondary)]">SafeWander © 2025</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-[var(--text-tertiary)]">
            <span className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-[var(--status-safe)]" />
              HIPAA Compliant
            </span>
            <span>v2.4.0</span>
          </div>
        </footer>
      </div>
    </AppShell>
  )
}
