"use client"

// Simplified PDF Viewer without external dependencies
// For full PDF rendering, consider using PDF.js or other libraries

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
  className, 
}: PDFViewerProps) {
  if (!file) {
    return (
      <div className={`flex items-center justify-center p-8 rounded-xl glass border border-[var(--glass-border)] ${className}`}>
        <p className="text-[var(--text-muted)]">ไม่มีไฟล์ PDF</p>
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-center p-8 rounded-xl glass border border-[var(--glass-border)] ${className}`}>
      <div className="text-center">
        <p className="text-[var(--text-primary)] font-medium mb-2">📄 PDF File Ready</p>
        <p className="text-sm text-[var(--text-muted)]">
          Preview ต้องการ browser extension หรือ download ไฟล์เพื่อดู
        </p>
      </div>
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
  className 
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
