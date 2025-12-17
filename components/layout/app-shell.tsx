import type React from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"

interface AppShellProps {
  children: React.ReactNode
  title?: string
  breadcrumb?: { label: string; href?: string }[]
}

export function AppShell({ children, title, breadcrumb }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Sidebar />
      <div className="pl-[260px]">
        <Header title={title} breadcrumb={breadcrumb} />
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}
