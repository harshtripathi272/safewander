import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, Navigation, AlertTriangle } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  return (
    <Card className="border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-[var(--text-primary)]">Quick Actions</CardTitle>
        <CardDescription className="text-[var(--text-tertiary)]">Immediate response tools</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Link href="/emergency" className="block">
          <Button className="w-full bg-gradient-to-r from-[var(--status-emergency)] to-[#991b1b] text-white hover:from-red-700 hover:to-red-800">
            <AlertTriangle className="mr-2 h-5 w-5" />
            SOS Emergency
          </Button>
        </Link>
        <Button
          variant="outline"
          className="w-full border-[var(--border-default)] bg-transparent text-[var(--text-primary)]"
        >
          <Phone className="mr-2 h-4 w-4" />
          Call
        </Button>
        <Button
          variant="outline"
          className="w-full border-[var(--border-default)] bg-transparent text-[var(--text-primary)]"
        >
          <Navigation className="mr-2 h-4 w-4" />
          Navigate
        </Button>
      </CardContent>
    </Card>
  )
}
