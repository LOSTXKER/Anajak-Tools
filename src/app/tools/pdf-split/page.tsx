"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { FileText, Upload, Download, Scissors, ArrowLeft, Sparkles, GripVertical, Check } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { PDFDocument } from "pdf-lib"
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
}: { 
  page: PageInfo
  onToggle: () => void
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
      <div className="aspect-[3/4] bg-white p-4 flex flex-col items-center justify-center">
        <FileText className="w-16 h-16 text-[var(--text-muted)] mb-3" />
        <p className="font-bold text-2xl text-[var(--text-primary)]">
          {page.pageNumber}
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          หน้า {page.pageNumber}
        </p>
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

export default function PDFSplitPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pages, setPages] = useState<PageInfo[]>([])
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
                ดู Preview ทุกหน้า จัดเรียง และแยก PDF
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
                        </p>
                      </div>
                    </div>

                    {/* Mode Selection */}
                    <div className="flex items-center gap-2">
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

                      <div className="h-8 w-px bg-[var(--border-default)]" />

                      <Button onClick={selectAll} variant="secondary" size="sm">
                        เลือกทั้งหมด
                      </Button>
                      <Button onClick={deselectAll} variant="secondary" size="sm">
                        ยกเลิกทั้งหมด
                      </Button>

                      <div className="h-8 w-px bg-[var(--border-default)]" />

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
                    คลิกเพื่อเลือก • ลากเพื่อจัดเรียง
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
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {[
            { icon: "🎯", title: "เลือกง่าย", desc: "คลิกเพื่อเลือก/ยกเลิก" },
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
