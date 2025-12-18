"use client"

import dynamic from "next/dynamic"
import { Card, CardContent } from "@/components/ui/card"
import type { Patient, Zone } from "@/lib/types"

interface LiveMapProps {
  patient: Patient
  zones: Zone[]
  className?: string
}

// Dynamically import the LiveMap component with no SSR
const LiveMapComponent = dynamic(() => import("./live-map").then((mod) => ({ default: mod.LiveMap })), {
  ssr: false,
  loading: () => (
    <Card className="border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
      <CardContent className="relative h-full min-h-[400px] overflow-hidden rounded-lg p-0 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--accent-primary)] border-t-transparent mx-auto" />
          <p className="mt-4 text-sm text-[var(--text-secondary)]">Loading map...</p>
        </div>
      </CardContent>
    </Card>
  ),
})

export function LiveMapWrapper({ patient, zones, className }: LiveMapProps) {
  return <LiveMapComponent patient={patient} zones={zones} className={className} />
}
