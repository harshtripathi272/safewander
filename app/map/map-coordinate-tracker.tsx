"use client"

import { useEffect, useState } from "react"
import { useMapEvents } from "react-leaflet"

interface Coordinates {
  lat: number
  lng: number
}

export default function MapCoordinateTracker() {
  const [coords, setCoords] = useState<Coordinates | null>(null)
  const [clickedCoords, setClickedCoords] = useState<Coordinates | null>(null)

  const map = useMapEvents({
    mousemove(e) {
      setCoords({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
    mouseout() {
      setCoords(null)
    },
    click(e) {
      setClickedCoords({ lat: e.latlng.lat, lng: e.latlng.lng })
      // Auto-clear clicked coords after 3 seconds
      setTimeout(() => setClickedCoords(null), 3000)
    },
  })

  const displayCoords = clickedCoords || coords

  if (!displayCoords) return null

  return (
    <div 
      className="absolute top-4 left-4 z-[1000] bg-[var(--bg-secondary)]/95 backdrop-blur-sm border border-[var(--border-default)] rounded-lg px-3 py-2 shadow-lg"
      style={{ pointerEvents: 'none' }}
    >
      <div className="flex items-center gap-2 text-sm">
        <span className="text-[var(--text-tertiary)]">
          {clickedCoords ? '📍 Clicked:' : '🖱️ Cursor:'}
        </span>
        <span className="font-mono text-[var(--text-primary)]">
          {displayCoords.lat.toFixed(6)}, {displayCoords.lng.toFixed(6)}
        </span>
      </div>
    </div>
  )
}
