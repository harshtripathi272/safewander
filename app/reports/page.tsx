import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Calendar, Clock, MapPin, Bell, ChevronRight } from "lucide-react"

const reports = [
  {
    id: "1",
    title: "Weekly Activity Summary",
    description: "Movement patterns, zone activity, and alert summary for the past 7 days",
    date: "Dec 15, 2024",
    type: "weekly",
  },
  {
    id: "2",
    title: "Monthly Health Report",
    description: "Comprehensive health metrics including vitals, sleep patterns, and medication adherence",
    date: "Dec 1, 2024",
    type: "monthly",
  },
  {
    id: "3",
    title: "Incident Report #9921",
    description: "Detailed incident documentation for alert triggered on Dec 10, 2024",
    date: "Dec 10, 2024",
    type: "incident",
  },
  {
    id: "4",
    title: "Caregiver Shift Log",
    description: "Notes and observations from caregiver shift changes",
    date: "Dec 14, 2024",
    type: "shift",
  },
]

const quickStats = [
  { icon: MapPin, label: "Zone Exits", value: "3", period: "This Week" },
  { icon: Bell, label: "Alerts", value: "12", period: "This Month" },
  { icon: Clock, label: "Active Hours", value: "6.5h", period: "Today" },
]

export default function ReportsPage() {
  return (
    <AppShell title="Reports">
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          {quickStats.map((stat, i) => (
            <Card key={i} className="border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-primary-muted)]">
                    <stat.icon className="h-5 w-5 text-[var(--accent-primary)]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      {stat.label} • {stat.period}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Generate Report Section */}
        <Card className="border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
          <CardHeader>
            <CardTitle className="text-lg text-[var(--text-primary)]">Generate New Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button className="bg-[var(--accent-primary)]">
                <FileText className="mr-2 h-4 w-4" />
                Weekly Summary
              </Button>
              <Button variant="outline" className="border-[var(--border-default)] bg-transparent">
                <Calendar className="mr-2 h-4 w-4" />
                Monthly Report
              </Button>
              <Button variant="outline" className="border-[var(--border-default)] bg-transparent">
                <MapPin className="mr-2 h-4 w-4" />
                Location History
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">Recent Reports</h2>
          <div className="space-y-3">
            {reports.map((report) => (
              <Card
                key={report.id}
                className="cursor-pointer border-[var(--border-subtle)] bg-[var(--bg-secondary)] transition-all hover:border-[var(--accent-primary)]"
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--bg-tertiary)]">
                      <FileText className="h-6 w-6 text-[var(--accent-primary)]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-[var(--text-primary)]">{report.title}</h3>
                        <Badge
                          variant="secondary"
                          className={
                            report.type === "incident"
                              ? "bg-red-500/15 text-red-400"
                              : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"
                          }
                        >
                          {report.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-[var(--text-tertiary)]">{report.description}</p>
                      <p className="mt-1 text-xs text-[var(--text-tertiary)]">{report.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                    <ChevronRight className="h-5 w-5 text-[var(--text-tertiary)]" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
