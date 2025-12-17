import { Card, CardContent } from "@/components/ui/card"
import { Heart, Footprints } from "lucide-react"

export function VitalsPanel() {
  return (
    <Card className="border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
      <CardContent className="grid grid-cols-2 gap-4 p-4">
        <div className="rounded-lg bg-[var(--bg-tertiary)] p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/15">
              <Heart className="h-4 w-4 text-red-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-[var(--text-primary)]">72</span>
              <span className="text-sm text-[var(--text-tertiary)]">bpm</span>
            </div>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">Heart Rate • Normal</p>
          </div>
        </div>

        <div className="rounded-lg bg-[var(--bg-tertiary)] p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/15">
              <Footprints className="h-4 w-4 text-blue-400" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-[var(--text-primary)]">1.2</span>
              <span className="text-sm text-[var(--text-tertiary)]">km</span>
            </div>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">Distance Today</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
