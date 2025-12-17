import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  sublabel?: string
  trend?: string
  trendUp?: boolean
  iconClassName?: string
}

export function StatCard({ icon: Icon, label, value, sublabel, trend, trendUp, iconClassName }: StatCardProps) {
  return (
    <Card className="border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              iconClassName || "bg-[var(--accent-primary-muted)]",
            )}
          >
            <Icon className="h-5 w-5 text-[var(--accent-primary)]" />
          </div>
          {sublabel && <span className="text-xs text-[var(--text-tertiary)]">{sublabel}</span>}
        </div>
        <div className="mt-4">
          <p className="text-3xl font-bold text-[var(--text-primary)]">{value}</p>
          <p className="mt-1 text-sm uppercase tracking-wide text-[var(--text-secondary)]">{label}</p>
          {trend && (
            <p className={cn("mt-2 text-sm", trendUp ? "text-[var(--status-safe)]" : "text-[var(--status-urgent)]")}>
              {trend}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
