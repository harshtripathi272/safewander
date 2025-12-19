"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Send, MapPin, Check, Smartphone } from "lucide-react"
import { toast } from "sonner"

interface GPSLinkSectionProps {
    patientId: string
    patientName: string
}

export function GPSLinkSection({ patientId, patientName }: GPSLinkSectionProps) {
    const [copied, setCopied] = useState(false)

    // Generate the tracker link
    const trackerLink = typeof window !== "undefined"
        ? `${window.location.origin}/tracker/${patientId}`
        : `/tracker/${patientId}`

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(trackerLink)
            setCopied(true)
            toast.success(
                <div className="flex flex-col gap-1">
                    <span className="font-medium">Link copied!</span>
                    <span className="text-xs text-[var(--text-tertiary)]">
                        In production, a mobile app will handle this link and provide background GPS access.
                    </span>
                </div>,
                {
                    duration: 5000,
                    position: "top-right",
                }
            )
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            toast.error("Failed to copy link")
        }
    }

    const handleSendLink = () => {
        // Simulate sending the link (in production this would send via SMS/email)
        toast.success(
            <div className="flex flex-col gap-1">
                <span className="font-medium">Link sent!</span>
                <span className="text-xs text-[var(--text-tertiary)]">
                    In production, a mobile app will receive this link and enable continuous GPS tracking.
                </span>
            </div>,
            {
                duration: 5000,
                position: "top-right",
            }
        )
    }

    return (
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] p-4">
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent-primary)]/20">
                    <MapPin className="h-5 w-5 text-[var(--accent-primary)]" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-[var(--text-primary)]">Request Location Access</h3>
                        <Badge variant="secondary" className="bg-blue-500/15 text-blue-400 text-xs">
                            GPS
                        </Badge>
                    </div>

                    <p className="text-sm text-[var(--text-secondary)] mb-3">
                        Ask {patientName.split(" ")[0]} to enable location sharing for real-time tracking.
                    </p>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            size="sm"
                            onClick={handleSendLink}
                            className="bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/90"
                        >
                            <Send className="mr-2 h-4 w-4" />
                            Send Link
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCopyLink}
                            className="border-[var(--border-default)] bg-transparent"
                        >
                            {copied ? (
                                <>
                                    <Check className="mr-2 h-4 w-4 text-green-400" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copy Link
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <Smartphone className="h-8 w-8 text-[var(--text-tertiary)] opacity-50" />
            </div>
        </div>
    )
}
