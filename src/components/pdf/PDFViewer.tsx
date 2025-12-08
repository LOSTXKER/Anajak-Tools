"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

interface PDFViewerProps {
  file: File | Blob | string | null
  className?: string
  showControls?: boolean
  initialPage?: number
  onPageChange?: (pageNumber: number) => void
  onLoadSuccess?: (numPages: number) => void
}

export function PDFViewer({ 
  file, 
  className = "", 
}: PDFViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setPdfUrl(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      let url: string

      if (typeof file === 'string') {
        // If it's already a URL
        url = file
      } else if (file instanceof File || file instanceof Blob) {
        // Create object URL from File/Blob
        url = URL.createObjectURL(file)
      } else {
        throw new Error('Invalid file type')
      }

      setPdfUrl(url)
      setLoading(false)

      // Cleanup function
      return () => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      }
    } catch (err: any) {
      console.error('Error loading PDF:', err)
      setError(err.message || 'ไม่สามารถโหลด PDF ได้')
      setLoading(false)
    }
  }, [file])

  if (!file) {
    return (
      <div className={`flex items-center justify-center p-8 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] ${className}`}>
        <p className="text-[var(--text-muted)]">ไม่มีไฟล์ PDF</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] ${className}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-2 text-[var(--primary-500)] animate-spin" />
          <p className="text-[var(--text-muted)]">กำลังโหลด PDF...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center p-8 rounded-xl bg-red-500/10 border border-red-500/20 ${className}`}>
        <div className="text-center">
          <p className="text-red-500 font-medium mb-1">⚠️ เกิดข้อผิดพลาด</p>
          <p className="text-sm text-[var(--text-muted)]">{error}</p>
        </div>
      </div>
    )
  }

  if (!pdfUrl) {
    return (
      <div className={`flex items-center justify-center p-8 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] ${className}`}>
        <p className="text-[var(--text-muted)]">ไม่สามารถแสดง PDF ได้</p>
      </div>
    )
  }

  return (
    <div className={`relative w-full h-full min-h-[400px] rounded-xl overflow-hidden border border-[var(--border-default)] bg-white ${className}`}>
      <iframe
        src={pdfUrl}
        className="w-full h-full min-h-[400px]"
        title="PDF Preview"
        style={{
          border: 'none',
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  )
}

// Simplified Thumbnail component
interface PDFThumbnailProps {
  file: File | Blob | string
  pageNumber: number
  selected?: boolean
  onClick?: () => void
  onRemove?: () => void
  className?: string
}

export function PDFThumbnail({ 
  pageNumber, 
  selected, 
  onClick, 
  className = ""
}: PDFThumbnailProps) {
  return (
    <div
      className={`relative group rounded-lg overflow-hidden border-2 transition-all cursor-pointer p-4 ${
        selected 
          ? "border-[var(--primary-500)] ring-2 ring-[var(--primary-500)]/20" 
          : "border-[var(--border-default)] hover:border-[var(--primary-500)]/50"
      } ${className}`}
      onClick={onClick}
    >
      <div className="text-center">
        <p className="font-bold text-[var(--text-primary)]">หน้า {pageNumber}</p>
      </div>
    </div>
  )
}
