"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Map,
  Users,
  Bell,
  FileText,
  Settings,
  Shield,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/map", label: "Live Map", icon: Map },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/alerts", label: "Alerts & Timeline", icon: Bell, badge: 3 },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/impact", label: "Impact Dashboard", icon: BarChart3 },
]

const bottomNavItems = [{ href: "/settings", label: "Settings", icon: Settings }]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)] transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[260px]",
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo Section */}
        <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-primary)]">
            <Shield className="h-6 w-6 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-semibold text-[var(--text-primary)]">SafeWander</h1>
              <p className="text-xs text-[var(--text-tertiary)]">Caregiver Portal</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-lg px-4 text-sm font-medium transition-all",
                  isActive
                    ? "border-l-[3px] border-[var(--accent-primary)] bg-[var(--accent-primary-muted)] text-[var(--accent-primary)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <Badge className="h-5 min-w-5 rounded-full bg-[var(--status-urgent)] px-1.5 text-xs text-white">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Link>
            )
          })}

          <div className="my-4 border-t border-[var(--border-subtle)]" />

          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-lg px-4 text-sm font-medium transition-all",
                  isActive
                    ? "border-l-[3px] border-[var(--accent-primary)] bg-[var(--accent-primary-muted)] text-[var(--accent-primary)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-[var(--border-default)] bg-[var(--bg-secondary)]"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>

        {/* User Section */}
        <div className="border-t border-[var(--border-subtle)] p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                <AvatarFallback>SJ</AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[var(--bg-secondary)] bg-[var(--status-safe)]" />
            </div>
            {!collapsed && (
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Sarah Jenkins</p>
                <p className="text-xs text-[var(--text-tertiary)]">Primary Caregiver</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
