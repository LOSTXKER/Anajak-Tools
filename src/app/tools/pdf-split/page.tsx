"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { FileText, Upload, Download, Scissors, ArrowLeft, Sparkles, GripVertical, Eye, Trash2, ZoomIn } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { PDFDocument } from "pdf-lib"
import { PDFViewer } from "@/components/pdf/PDFViewer"
import { formatFileSize } from "@/lib/utils"
import JSZip from "jszip"
import { saveAs } from "file-saver"
import Link from "next/link"
import { motion } from "framer-motion"
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface PageInfo {
  id: string
  pageNumber: number
  selected: boolean
}

function SortablePage({ 
  page, 
  onToggle, 
  onRemove, 
  onPreview,
  isPreviewPage 
}: { 
  page: PageInfo
  onToggle: () => void
  onRemove: () => void
  onPreview: () => void
  isPreviewPage: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: page.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative p-4 rounded-xl border-2 transition-all cursor-pointer
        ${page.selected 
          ? 'bg-[var(--primary-500)]/10 border-[var(--primary-500)]' 
          : isPreviewPage
          ? 'bg-emerald-500/10 border-emerald-500'
          : 'glass border-[var(--glass-border)] hover:border-[var(--primary-500)]/30'
        }
      `}
      onClick={onPreview}
    >
      <div className="flex items-center gap-3">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="p-2 rounded-lg hover:bg-[var(--bg-surface)] cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-5 h-5 text-[var(--text-muted)]" />
        </button>

        {/* Checkbox */}
        <input
          type="checkbox"
          checked={page.selected}
          onChange={onToggle}
          onClick={(e) => e.stopPropagation()}
          className="w-5 h-5 accent-[var(--primary-500)] rounded cursor-pointer"
        />
        
        {/* Info */}
        <div className="flex-1">
          <p className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
            หน้า {page.pageNumber}
            {isPreviewPage && (
              <span className="text-xs bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded">
                กำลังดู
              </span>
            )}
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            {page.selected ? '✓ เลือกแล้ว' : 'คลิกเพื่อดู'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onPreview()
            }}
            className="p-2 rounded-lg hover:bg-[var(--primary-500)]/10 text-[var(--primary-500)] transition-colors"
            title="ดู Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="p-2 rounded-lg hover:bg-[var(--error)]/10 text-[var(--text-muted)] hover:text-[var(--error)] transition-colors opacity-0 group-hover:opacity-100"
            title="ลบหน้านี้"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PDFSplitPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pages, setPages] = useState<PageInfo[]>([])
  const [currentPreviewPage, setCurrentPreviewPage] = useState(1)
  const [splitting, setSplitting] = useState(false)
  const [splitMode, setSplitMode] = useState<'selected' | 'individual'>('selected')

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

      // Create page info
      const pageInfos: PageInfo[] = []
      for (let i = 0; i < pageCount; i++) {
        pageInfos.push({
          id: `page-${i}`,
          pageNumber: i + 1,
          selected: true,
        })
      }

      setPages(pageInfos)
      setCurrentPreviewPage(1)
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

  const removePage = (index: number) => {
    const removedPage = pages[index]
    const newPages = pages.filter((_, i) => i !== index)
    setPages(newPages)
    
    // Adjust preview page if needed
    if (currentPreviewPage === removedPage.pageNumber) {
      setCurrentPreviewPage(newPages.length > 0 ? newPages[0].pageNumber : 1)
    }
  }

  const selectAll = () => {
    setPages(pages.map(p => ({ ...p, selected: true })))
  }

  const deselectAll = () => {
    setPages(pages.map(p => ({ ...p, selected: false })))
  }

  const splitPDF = async () => {
    if (!pdfFile || pages.length === 0) return

    setSplitting(true)

    try {
      const arrayBuffer = await pdfFile.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)

      if (splitMode === 'selected') {
        // Create one PDF with selected pages in order
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
        const blob = new Blob([pdfBytes], { type: 'application/pdf' })
        saveAs(blob, `split-${pdfFile.name}`)
      } else {
        // Split into individual PDFs
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
      <div className="container mx-auto max-w-[1600px]">
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
                ดู Preview ขนาดใหญ่ จัดเรียงหน้า และแยก PDF
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
          // Main Content: Preview + Pages List
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Large Preview */}
            <div className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card variant="glass">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <ZoomIn className="w-5 h-5 text-[var(--primary-500)]" />
                          Preview - หน้า {currentPreviewPage}
                        </CardTitle>
                        <CardDescription>คลิกที่รายการด้านขวาเพื่อเปลี่ยนหน้า</CardDescription>
                      </div>
                      <div className="text-sm text-[var(--text-muted)]">
                        {pdfFile.name} • {formatFileSize(pdfFile.size)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <PDFViewer 
                      file={pdfFile} 
                      className="h-[700px]"
                      initialPage={currentPreviewPage}
                      onPageChange={setCurrentPreviewPage}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right: Pages List + Settings */}
            <div className="lg:col-span-4 space-y-6">
              {/* Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle>ตั้งค่า</CardTitle>
                    <CardDescription>เลือกวิธีแยก</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Mode Selection */}
                    <div className="space-y-2">
                      {[
                        { value: 'selected', label: 'หน้าที่เลือก', desc: 'รวมหน้าที่เลือกเป็น PDF เดียว' },
                        { value: 'individual', label: 'แยกแต่ละหน้า', desc: 'แยกแต่ละหน้าเป็นไฟล์ (ZIP)' },
                      ].map((mode) => (
                        <label
                          key={mode.value}
                          className={`
                            flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all
                            ${splitMode === mode.value
                              ? 'bg-[var(--primary-500)]/10 border border-[var(--primary-500)]'
                              : 'glass border border-[var(--glass-border)] hover:border-[var(--primary-500)]'
                            }
                          `}
                        >
                          <input
                            type="radio"
                            name="splitMode"
                            value={mode.value}
                            checked={splitMode === mode.value}
                            onChange={() => setSplitMode(mode.value as any)}
                            className="w-4 h-4 accent-[var(--primary-500)]"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm text-[var(--text-primary)]">
                              {mode.label}
                            </p>
                            <p className="text-xs text-[var(--text-secondary)]">
                              {mode.desc}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="p-3 rounded-lg bg-[var(--bg-surface)]">
                      <p className="text-sm text-[var(--text-muted)]">
                        เลือกแล้ว: <span className="font-bold text-[var(--primary-500)]">{selectedCount}</span>/{pages.length} หน้า
                      </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button onClick={selectAll} variant="secondary" size="sm">
                        เลือกทั้งหมด
                      </Button>
                      <Button onClick={deselectAll} variant="secondary" size="sm">
                        ยกเลิกทั้งหมด
                      </Button>
                    </div>

                    {/* Split Button */}
                    <Button
                      onClick={splitPDF}
                      disabled={splitting || selectedCount === 0}
                      isLoading={splitting}
                      className="w-full h-12"
                    >
                      <Scissors className="w-5 h-5" />
                      {splitting ? 'กำลังแยก...' : 'แยก PDF'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Pages List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[var(--primary-500)]" />
                      หน้าทั้งหมด ({pages.length})
                    </CardTitle>
                    <CardDescription>
                      ลากเพื่อจัดเรียง • คลิกเพื่อดู
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
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                          {pages.map((page, index) => (
                            <SortablePage
                              key={page.id}
                              page={page}
                              onToggle={() => togglePage(index)}
                              onRemove={() => removePage(index)}
                              onPreview={() => setCurrentPreviewPage(page.pageNumber)}
                              isPreviewPage={currentPreviewPage === page.pageNumber}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        )}

        {/* Features */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {[
            { icon: "🔍", title: "Preview ใหญ่", desc: "ดูหน้าชัดเจนก่อนแยก" },
            { icon: "🔀", title: "จัดเรียงง่าย", desc: "ลากเพื่อจัดลำดับหน้า" },
            { icon: "✂️", title: "แยกอิสระ", desc: "เลือกหน้าที่ต้องการได้" },
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
