import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { ActivityEvent } from "@/lib/types"
import { cn } from "@/lib/utils"
import { MapPin, Bell, Heart, CheckCircle, Activity } from "lucide-react"
import Link from "next/link"

interface ActivityFeedProps {
  activities: ActivityEvent[]
}

const activityIcons = {
  zone_enter: MapPin,
  zone_exit: MapPin,
  alert: Bell,
  check_in: CheckCircle,
  vitals: Heart,
}

const activityColors = {
  zone_enter: "text-[var(--status-safe)] bg-[var(--accent-primary-muted)]",
  zone_exit: "text-[var(--status-warning)] bg-orange-500/15",
  alert: "text-[var(--status-urgent)] bg-red-500/15",
  check_in: "text-[var(--accent-secondary)] bg-[var(--accent-secondary-muted)]",
  vitals: "text-red-400 bg-red-500/15",
}

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card className="border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg text-[var(--text-primary)]">Activity History</CardTitle>
        <Link href="/alerts">
          <Button variant="link" className="h-auto p-0 text-[var(--accent-primary)]">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.slice(0, 5).map((activity) => {
          const Icon = activityIcons[activity.type] || Activity // Fallback to Activity icon
          const colorClass = activityColors[activity.type] || "text-blue-400 bg-blue-500/15" // Fallback color
          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div
                className={cn(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  colorClass,
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 border-b border-[var(--border-subtle)] pb-4 last:border-0 last:pb-0">
                <p className="text-sm font-medium text-[var(--text-primary)]">{activity.title}</p>
                {activity.description && (
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">{activity.description}</p>
                )}
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                  {formatTime(activity.timestamp)}
                  {activity.zone && ` • Zone: ${activity.zone}`}
                </p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
