"use client"

import { Bell, Search, Settings } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface HeaderProps {
  title?: string
  breadcrumb?: { label: string; href?: string }[]
}

export function Header({ title, breadcrumb }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-6">
      {/* Left Section */}
      <div>
        {breadcrumb ? (
          <nav className="flex items-center gap-2 text-sm">
            {breadcrumb.map((item, index) => (
              <span key={index} className="flex items-center gap-2">
                {index > 0 && <span className="text-[var(--text-tertiary)]">/</span>}
                <span
                  className={
                    index === breadcrumb.length - 1
                      ? "font-medium text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }
                >
                  {item.label}
                </span>
              </span>
            ))}
          </nav>
        ) : (
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">{title}</h1>
        )}
      </div>

      {/* Center Section - Search */}
      <div className="hidden max-w-md flex-1 px-8 md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <Input
            type="search"
            placeholder="Search patients, zones..."
            className="h-10 border-[var(--border-default)] bg-[var(--bg-tertiary)] pl-9 text-sm"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* System Status */}
        <div className="hidden items-center gap-2 rounded-full bg-[var(--accent-primary-muted)] px-3 py-1.5 lg:flex">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--status-safe)]" />
          <span className="text-xs font-medium uppercase tracking-wide text-[var(--status-safe)]">
            System Operational
          </span>
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-[var(--text-secondary)]" />
          <Badge className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full bg-[var(--status-urgent)] px-1.5 text-xs text-white">
            3
          </Badge>
        </Button>

        {/* Settings */}
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5 text-[var(--text-secondary)]" />
        </Button>

        {/* User Avatar */}
        <Avatar className="h-9 w-9 border-2 border-[var(--accent-primary)]">
          <AvatarImage src="/placeholder.svg?height=36&width=36" />
          <AvatarFallback>SJ</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
