"use client"

import { useState, useEffect } from "react"
import { Document, Page, pdfjs } from 'react-pdf'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, X } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface PDFViewerProps {
  file: File | string | null
  className?: string
  showControls?: boolean
  initialPage?: number
  onPageChange?: (pageNumber: number) => void
  onLoadSuccess?: (numPages: number) => void
}

export function PDFViewer({ 
  file, 
  className, 
  showControls = true,
  initialPage = 1,
  onPageChange,
  onLoadSuccess
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState(initialPage)
  const [scale, setScale] = useState(1.0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    setPageNumber(initialPage)
  }, [initialPage])

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    onLoadSuccess?.(numPages)
  }

  const changePage = (offset: number) => {
    const newPage = pageNumber + offset
    if (newPage >= 1 && newPage <= numPages) {
      setPageNumber(newPage)
      onPageChange?.(newPage)
    }
  }

  const zoomIn = () => setScale(Math.min(scale + 0.2, 3.0))
  const zoomOut = () => setScale(Math.max(scale - 0.2, 0.5))

  if (!file) {
    return (
      <div className={cn("flex items-center justify-center p-8 rounded-xl glass border border-[var(--glass-border)]", className)}>
        <p className="text-[var(--text-muted)]">ไม่มีไฟล์ PDF</p>
      </div>
    )
  }

  return (
    <>
      <div className={cn("relative rounded-xl glass border border-[var(--glass-border)] overflow-hidden", className)}>
        {/* PDF Document */}
        <div className={cn(
          "overflow-auto custom-scrollbar bg-[var(--bg-subtle)]",
          isFullscreen ? "fixed inset-0 z-50 bg-black/95" : "max-h-[600px]"
        )}>
          <div className="flex items-center justify-center p-4">
            <Document
              file={file}
              onLoadSuccess={onDocumentLoadSuccess}
              className="flex justify-center"
              loading={
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-500)]"></div>
                </div>
              }
              error={
                <div className="flex items-center justify-center p-8 text-red-500">
                  ไม่สามารถโหลด PDF ได้
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                className="shadow-lg"
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </Document>
          </div>
        </div>

        {/* Controls */}
        {showControls && numPages > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between gap-4">
              {/* Page Navigation */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => changePage(-1)}
                  disabled={pageNumber <= 1}
                  className="bg-white/10 hover:bg-white/20 text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium text-white px-3 py-1 rounded-lg bg-white/10">
                  {pageNumber} / {numPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => changePage(1)}
                  disabled={pageNumber >= numPages}
                  className="bg-white/10 hover:bg-white/20 text-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={zoomOut}
                  disabled={scale <= 0.5}
                  className="bg-white/10 hover:bg-white/20 text-white"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium text-white px-3 py-1 rounded-lg bg-white/10">
                  {Math.round(scale * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={zoomIn}
                  disabled={scale >= 3.0}
                  className="bg-white/10 hover:bg-white/20 text-white"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>

              {/* Fullscreen */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="bg-white/10 hover:bg-white/20 text-white"
              >
                {isFullscreen ? <X className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-40 bg-black/95" onClick={() => setIsFullscreen(false)} />
      )}
    </>
  )
}

// Thumbnail component for showing multiple pages
interface PDFThumbnailProps {
  file: File | string
  pageNumber: number
  selected?: boolean
  onClick?: () => void
  onRemove?: () => void
  className?: string
}

export function PDFThumbnail({ 
  file, 
  pageNumber, 
  selected, 
  onClick, 
  onRemove,
  className 
}: PDFThumbnailProps) {
  return (
    <div
      className={cn(
        "relative group rounded-lg overflow-hidden border-2 transition-all cursor-pointer",
        selected 
          ? "border-[var(--primary-500)] ring-2 ring-[var(--primary-500)]/20" 
          : "border-[var(--border-default)] hover:border-[var(--primary-500)]/50",
        className
      )}
      onClick={onClick}
    >
      <Document file={file} className="bg-white">
        <Page
          pageNumber={pageNumber}
          width={150}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </Document>
      
      {/* Page Number Badge */}
      <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded">
        {pageNumber}
      </div>

      {/* Remove Button */}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-3 h-3" />
        </button>
      )}

      {/* Selected Overlay */}
      {selected && (
        <div className="absolute inset-0 bg-[var(--primary-500)]/10 pointer-events-none" />
      )}
    </div>
  )
}

