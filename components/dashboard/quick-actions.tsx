"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Phone } from "lucide-react"
import { toast } from "sonner"

export function QuickActions() {
  const handleCall911 = () => {
    // Show notification that in production this would connect to real emergency
    toast.info("In production, this will connect to a real emergency call", {
      duration: 4000,
      position: "top-right",
    })
  }

  return (
    <Card className="border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
      <CardContent className="p-4">
        <Button
          onClick={handleCall911}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold h-12"
        >
          <Phone className="mr-2 h-5 w-5" />
          Call 911
        </Button>
      </CardContent>
    </Card>
  )
}
