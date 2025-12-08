"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { FileText, Upload, Download, Scissors, ArrowLeft, Sparkles, GripVertical, Check, Loader2, ZoomIn, X, ChevronLeft, ChevronRight } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { PDFDocument } from "pdf-lib"
import { formatFileSize } from "@/lib/utils"
import { usePDFThumbnails } from "@/hooks/usePDFThumbnails"
import JSZip from "jszip"
import { saveAs } from "file-saver"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface PageInfo {
  id: string
  pageNumber: number
  selected: boolean
}

function SortablePageCard({ 
  page, 
  onToggle,
  onZoom,
  thumbnailUrl,
  isLoading,
}: { 
  page: PageInfo
  onToggle: () => void
  onZoom: () => void
  thumbnailUrl?: string
  isLoading?: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: (page.pageNumber - 1) * 0.02 }}
      className={`
        relative group cursor-pointer rounded-xl border-2 transition-all overflow-hidden
        ${page.selected 
          ? 'border-[var(--primary-500)] ring-2 ring-[var(--primary-500)]/20 shadow-lg' 
          : 'border-[var(--border-default)] hover:border-[var(--primary-500)]/50'
        }
      `}
      onClick={onToggle}
    >
      {/* Drag Handle */}
      <div 
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 p-2 rounded-lg bg-black/60 backdrop-blur-sm cursor-grab active:cursor-grabbing z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-4 h-4 text-white" />
      </div>

      {/* Zoom Button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onZoom()
        }}
        className="absolute top-2 left-12 p-2 rounded-lg bg-black/60 backdrop-blur-sm z-10 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
        title="ขยายดู"
      >
        <ZoomIn className="w-4 h-4 text-white" />
      </button>

      {/* Checkbox */}
      <div className="absolute top-2 right-2 z-10">
        <div className={`
          w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all
          ${page.selected 
            ? 'bg-[var(--primary-500)] border-[var(--primary-500)]' 
            : 'bg-white/90 border-gray-300 group-hover:border-[var(--primary-500)]'
          }
        `}>
          {page.selected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
        </div>
      </div>

      {/* Page Preview */}
      <div className="aspect-[3/4] bg-white relative overflow-hidden">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[var(--primary-500)] animate-spin" />
          </div>
        ) : thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={`Page ${page.pageNumber}`}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <FileText className="w-12 h-12 text-[var(--text-muted)] mb-2" />
            <p className="font-bold text-xl text-[var(--text-primary)]">
              {page.pageNumber}
            </p>
          </div>
        )}
      </div>

      {/* Page Number Badge */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <p className="text-white font-semibold text-center text-sm">
          หน้า {page.pageNumber}
        </p>
      </div>

      {/* Selected Overlay */}
      {page.selected && (
        <div className="absolute inset-0 bg-[var(--primary-500)]/10 pointer-events-none" />
      )}
    </motion.div>
  )
}

// Lightbox Modal Component with High-Res Images
function PageLightbox({
  isOpen,
  onClose,
  currentPage,
  pages,
  thumbnails,
  fullImages,
  loadFullImage,
  onNavigate,
}: {
  isOpen: boolean
  onClose: () => void
  currentPage: number
  pages: PageInfo[]
  thumbnails: Map<number, string>
  fullImages: Map<number, string>
  loadFullImage: (pageNumber: number) => Promise<void>
  onNavigate: (pageNumber: number) => void
}) {
  const [loadingFullImage, setLoadingFullImage] = useState(false)

  // Load high-res image when current page changes
  useEffect(() => {
    if (isOpen && currentPage && !fullImages.has(currentPage)) {
      setLoadingFullImage(true)
      loadFullImage(currentPage).finally(() => {
        setLoadingFullImage(false)
      })
    }
  }, [isOpen, currentPage, fullImages, loadFullImage])

  if (!isOpen) return null

  const currentIndex = pages.findIndex(p => p.pageNumber === currentPage)
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < pages.length - 1

  const goToPrev = () => {
    if (hasPrev) {
      onNavigate(pages[currentIndex - 1].pageNumber)
    }
  }

  const goToNext = () => {
    if (hasNext) {
      onNavigate(pages[currentIndex + 1].pageNumber)
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowLeft') goToPrev()
    if (e.key === 'ArrowRight') goToNext()
  }

  // Use full image if available, otherwise fall back to thumbnail
  const displayImage = fullImages.get(currentPage) || thumbnails.get(currentPage)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-50"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Page Counter & Quality Indicator */}
        <div className="absolute top-4 left-4 flex items-center gap-3">
          <div className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm">
            <p className="text-white font-semibold">
              หน้า {currentPage} / {pages.length}
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            fullImages.has(currentPage) 
              ? 'bg-green-500/20 text-green-300' 
              : loadingFullImage 
                ? 'bg-yellow-500/20 text-yellow-300'
                : 'bg-white/10 text-white/70'
          }`}>
            {fullImages.has(currentPage) 
              ? '✓ HD' 
              : loadingFullImage 
                ? '⏳ กำลังโหลด HD...'
                : 'SD'}
          </div>
        </div>

        {/* Navigation - Previous */}
        {hasPrev && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              goToPrev()
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>
        )}

        {/* Navigation - Next */}
        {hasNext && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              goToNext()
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>
        )}

        {/* Main Image */}
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="max-w-[90vw] max-h-[85vh] relative"
          onClick={(e) => e.stopPropagation()}
        >
          {displayImage ? (
            <div className="relative">
              <img
                src={displayImage}
                alt={`Page ${currentPage}`}
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              />
              {/* Loading overlay when upgrading to HD */}
              {loadingFullImage && !fullImages.has(currentPage) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/60 backdrop-blur-sm">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                    <span className="text-white text-sm">กำลังโหลดภาพ HD...</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-[600px] h-[800px] bg-white rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-[var(--primary-500)] mx-auto mb-4 animate-spin" />
                <p className="text-2xl font-bold text-[var(--text-primary)]">หน้า {currentPage}</p>
                <p className="text-[var(--text-muted)]">กำลังโหลด...</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Thumbnail Strip */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 rounded-xl bg-black/50 backdrop-blur-sm max-w-[90vw] overflow-x-auto">
          {pages.map((page) => (
            <button
              key={page.id}
              onClick={(e) => {
                e.stopPropagation()
                onNavigate(page.pageNumber)
              }}
              className={`
                flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-all
                ${page.pageNumber === currentPage 
                  ? 'border-[var(--primary-500)] ring-2 ring-[var(--primary-500)]/50' 
                  : 'border-transparent hover:border-white/50'
                }
              `}
            >
              {thumbnails.has(page.pageNumber) ? (
                <img
                  src={thumbnails.get(page.pageNumber)}
                  alt={`Page ${page.pageNumber}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-white flex items-center justify-center">
                  <span className="text-xs font-bold">{page.pageNumber}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function PDFSplitPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pages, setPages] = useState<PageInfo[]>([])
  const [splitting, setSplitting] = useState(false)
  const [splitMode, setSplitMode] = useState<'selected' | 'individual'>('selected')
  
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxPage, setLightboxPage] = useState(1)

  // Get thumbnails (small) and fullImages (high-res) from hook
  const { thumbnails, fullImages, loading: thumbnailsLoading, loadFullImage } = usePDFThumbnails(pdfFile)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setPdfFile(file)
    
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const pageCount = pdfDoc.getPageCount()

      const pageInfos: PageInfo[] = []
      for (let i = 0; i < pageCount; i++) {
        pageInfos.push({
          id: `page-${i}`,
          pageNumber: i + 1,
          selected: true,
        })
      }

      setPages(pageInfos)
    } catch (error) {
      console.error('Error reading PDF:', error)
      alert('ไม่สามารถอ่านไฟล์ PDF ได้ กรุณาลองไฟล์อื่น')
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  })

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setPages((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const togglePage = (index: number) => {
    const updated = [...pages]
    updated[index].selected = !updated[index].selected
    setPages(updated)
  }

  const selectAll = () => {
    setPages(pages.map(p => ({ ...p, selected: true })))
  }

  const deselectAll = () => {
    setPages(pages.map(p => ({ ...p, selected: false })))
  }

  const openLightbox = (pageNumber: number) => {
    setLightboxPage(pageNumber)
    setLightboxOpen(true)
  }

  const splitPDF = async () => {
    if (!pdfFile || pages.length === 0) return

    setSplitting(true)

    try {
      const arrayBuffer = await pdfFile.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)

      if (splitMode === 'selected') {
        const selectedPages = pages.filter(p => p.selected)
        if (selectedPages.length === 0) {
          alert('กรุณาเลือกหน้าที่ต้องการ')
          setSplitting(false)
          return
        }

        const newPdf = await PDFDocument.create()
        for (const page of selectedPages) {
          const [copiedPage] = await newPdf.copyPages(pdfDoc, [page.pageNumber - 1])
          newPdf.addPage(copiedPage)
        }

        const pdfBytes = await newPdf.save()
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
        saveAs(blob, `split-${pdfFile.name}`)
      } else {
        const zip = new JSZip()
        const selectedPages = pages.filter(p => p.selected)

        for (const page of selectedPages) {
          const newPdf = await PDFDocument.create()
          const [copiedPage] = await newPdf.copyPages(pdfDoc, [page.pageNumber - 1])
          newPdf.addPage(copiedPage)
          
          const pdfBytes = await newPdf.save()
          zip.file(
            `${pdfFile.name.replace('.pdf', '')}-page-${page.pageNumber}.pdf`,
            pdfBytes
          )
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' })
        saveAs(zipBlob, `${pdfFile.name.replace('.pdf', '')}-split.zip`)
      }
    } catch (error) {
      console.error('Error splitting PDF:', error)
      alert('เกิดข้อผิดพลาดในการแยก PDF')
    } finally {
      setSplitting(false)
    }
  }

  const selectedCount = pages.filter(p => p.selected).length

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="container mx-auto max-w-[1800px]">
        {/* Lightbox Modal with High-Res Support */}
        <PageLightbox
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          currentPage={lightboxPage}
          pages={pages}
          thumbnails={thumbnails}
          fullImages={fullImages}
          loadFullImage={loadFullImage}
          onNavigate={setLightboxPage}
        />

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link href="/tools" className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary-500)] transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">กลับไปหน้าเครื่องมือ</span>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div 
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] flex items-center justify-center shadow-lg shadow-[var(--primary-500)]/20">
              <Scissors className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
                แยก PDF
              </h1>
              <p className="text-[var(--text-secondary)] mt-1">
                ดู Preview ทุกหน้า จัดเรียง และแยก PDF • คลิก 🔍 เพื่อดูภาพความละเอียดสูง
              </p>
            </div>
          </div>
        </motion.div>

        {!pdfFile ? (
          // Upload Section
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[var(--primary-500)]" />
                  อัพโหลด PDF
                </CardTitle>
                <CardDescription>เลือกไฟล์ที่ต้องการแยก</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  {...getRootProps()}
                  className={`
                    border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all
                    ${isDragActive 
                      ? 'border-[var(--primary-500)] bg-[var(--primary-500)]/5' 
                      : 'border-[var(--border-default)] hover:border-[var(--primary-500)]'
                    }
                  `}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-20 h-20 mx-auto mb-6 text-[var(--text-muted)]" />
                  {isDragActive ? (
                    <p className="text-[var(--primary-500)] font-medium text-xl">วางไฟล์ PDF...</p>
                  ) : (
                    <div>
                      <p className="font-semibold text-[var(--text-primary)] mb-2 text-xl">
                        ลากไฟล์ PDF มาวางที่นี่
                      </p>
                      <p className="text-sm text-[var(--text-muted)] mb-6">
                        หรือคลิกเพื่อเลือกไฟล์
                      </p>
                      <Button variant="secondary" size="lg">
                        <Upload className="w-5 h-5" />
                        เลือกไฟล์ PDF
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card variant="glass">
                <CardContent className="py-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* File Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[var(--primary-500)]/10 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-[var(--primary-500)]" />
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--text-primary)]">
                          {pdfFile.name}
                        </p>
                        <p className="text-sm text-[var(--text-muted)]">
                          {formatFileSize(pdfFile.size)} • {pages.length} หน้า • เลือก {selectedCount} หน้า
                          {thumbnailsLoading && <span className="ml-2 text-[var(--primary-500)]">• กำลังโหลด Preview...</span>}
                        </p>
                      </div>
                    </div>

                    {/* Mode Selection */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-2 p-1 rounded-lg bg-[var(--bg-surface)]">
                        <button
                          onClick={() => setSplitMode('selected')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            splitMode === 'selected'
                              ? 'bg-[var(--primary-500)] text-white'
                              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          หน้าที่เลือก
                        </button>
                        <button
                          onClick={() => setSplitMode('individual')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            splitMode === 'individual'
                              ? 'bg-[var(--primary-500)] text-white'
                              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          แยกแต่ละหน้า
                        </button>
                      </div>

                      <div className="h-8 w-px bg-[var(--border-default)] hidden sm:block" />

                      <Button onClick={selectAll} variant="secondary" size="sm">
                        เลือกทั้งหมด
                      </Button>
                      <Button onClick={deselectAll} variant="secondary" size="sm">
                        ยกเลิกทั้งหมด
                      </Button>

                      <div className="h-8 w-px bg-[var(--border-default)] hidden sm:block" />

                      <Button
                        onClick={splitPDF}
                        disabled={splitting || selectedCount === 0}
                        isLoading={splitting}
                        className="min-w-[140px]"
                      >
                        <Scissors className="w-5 h-5" />
                        {splitting ? 'กำลังแยก...' : 'แยก PDF'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pages Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[var(--primary-500)]" />
                    ทุกหน้า ({pages.length} หน้า)
                  </CardTitle>
                  <CardDescription>
                    คลิกเพื่อเลือก • ลากเพื่อจัดเรียง • 🔍 เพื่อขยายดูแบบ HD
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={pages.map(p => p.id)}
                      strategy={rectSortingStrategy}
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
                        {pages.map((page, index) => (
                          <SortablePageCard
                            key={page.id}
                            page={page}
                            onToggle={() => togglePage(index)}
                            onZoom={() => openLightbox(page.pageNumber)}
                            thumbnailUrl={thumbnails.get(page.pageNumber)}
                            isLoading={thumbnailsLoading && !thumbnails.has(page.pageNumber)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Features */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {[
            { icon: "👁️", title: "ดู Preview", desc: "เห็นเนื้อหาจริง" },
            { icon: "🔍", title: "ขยาย HD", desc: "ดูภาพความละเอียดสูง" },
            { icon: "🔀", title: "จัดเรียง", desc: "ลากจัดลำดับ" },
            { icon: "✂️", title: "แยกอิสระ", desc: "เลือกเฉพาะหน้า" },
          ].map((feature, i) => (
            <div key={i} className="p-5 rounded-2xl glass border border-[var(--glass-border)] hover:border-[var(--primary-500)]/30 transition-colors">
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h4 className="font-bold text-[var(--text-primary)] mb-1">{feature.title}</h4>
              <p className="text-sm text-[var(--text-secondary)]">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
