"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { FileText, Upload, Download, Trash2, GripVertical, Eye } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { PDFDocument } from "pdf-lib"
import { formatFileSize } from "@/lib/utils"
import { PDFViewer } from "@/components/pdf/PDFViewer"
import Link from "next/link"
import { motion } from "framer-motion"

interface PDFFile {
  id: string
  file: File
  name: string
  size: number
  pages?: number
}

export default function PDFMergePage() {
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([])
  const [merging, setMerging] = useState(false)
  const [previewFile, setPreviewFile] = useState<File | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const onDrop = async (acceptedFiles: File[]) => {
    const newFiles: PDFFile[] = []
    
    for (const file of acceptedFiles) {
      // Get page count
      let pages = 0
      try {
        const arrayBuffer = await file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer)
        pages = pdfDoc.getPageCount()
      } catch (error) {
        console.error('Error reading PDF:', error)
      }

      newFiles.push({
        id: Date.now().toString() + Math.random(),
        file,
        name: file.name,
        size: file.size,
        pages
      })
    }
    
    setPdfFiles(prev => [...prev, ...newFiles])
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true
  })

  const removeFile = (id: string) => {
    setPdfFiles(prev => prev.filter(f => f.id !== id))
  }

  const mergePDFs = async () => {
    if (pdfFiles.length < 2) return

    setMerging(true)
    
    try {
      const mergedPdf = await PDFDocument.create()

      for (const pdfFile of pdfFiles) {
        const arrayBuffer = await pdfFile.file.arrayBuffer()
        const pdf = await PDFDocument.load(arrayBuffer)
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
        copiedPages.forEach((page) => mergedPdf.addPage(page))
      }

      const mergedPdfBytes = await mergedPdf.save()
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = 'merged.pdf'
      link.click()
      
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error merging PDFs:', error)
      alert('เกิดข้อผิดพลาดในการรวม PDF กรุณาลองใหม่อีกครั้ง')
    } finally {
      setMerging(false)
    }
  }

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const newFiles = [...pdfFiles]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    
    if (newIndex < 0 || newIndex >= newFiles.length) return
    
    [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]]
    setPdfFiles(newFiles)
  }

  const totalPages = pdfFiles.reduce((sum, file) => sum + (file.pages || 0), 0)
  const totalSize = pdfFiles.reduce((sum, file) => sum + file.size, 0)

  const openPreview = (file: File) => {
    setPreviewFile(file)
    setShowPreview(true)
  }

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link href="/tools" className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary-500)] transition-colors mb-8 group">
            <span className="text-sm font-medium">← กลับไปหน้าเครื่องมือ</span>
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
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
                รวม PDF
              </h1>
              <p className="text-[var(--text-secondary)] mt-1">
                รวมไฟล์ PDF หลายไฟล์เป็นไฟล์เดียว
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Upload & Files */}
          <div className="lg:col-span-2 space-y-6">

            {/* Upload Area */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle>อัพโหลดไฟล์</CardTitle>
                <CardDescription>เลือก PDF ที่ต้องการรวม</CardDescription>
              </CardHeader>
              <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
              ${isDragActive 
                ? 'border-[var(--primary-500)] bg-[var(--primary-500)]/5' 
                : 'border-[var(--border-default)] hover:border-[var(--primary-500)]'
              }
            `}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)]" />
            {isDragActive ? (
              <p className="text-[var(--primary-500)] font-medium">วางไฟล์ PDF ที่นี่...</p>
            ) : (
              <div>
                <p className="font-medium text-[var(--text-primary)] mb-2">
                  ลากไฟล์ PDF มาวางที่นี่
                </p>
                <p className="text-sm text-[var(--text-muted)] mb-4">
                  หรือคลิกเพื่อเลือกไฟล์ (สามารถเลือกหลายไฟล์)
                </p>
                <Button variant="secondary" size="sm">
                  เลือกไฟล์ PDF
                </Button>
              </div>
            )}
          </div>
              </CardContent>
            </Card>

            {/* Files List */}
            {pdfFiles.length > 0 && (
              <Card variant="glass">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>ไฟล์ที่เลือก ({pdfFiles.length})</CardTitle>
                      <CardDescription>
                        {totalPages} หน้า • {formatFileSize(totalSize)}
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => setPdfFiles([])}
                      variant="ghost"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      ล้างทั้งหมด
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {pdfFiles.map((pdfFile, index) => (
                    <div
                      key={pdfFile.id}
                      className="flex items-center gap-3 p-3 rounded-lg glass border border-[var(--glass-border)] hover:border-[var(--primary-500)] transition-colors"
                    >
                      <div className="flex gap-1">
                        <button
                          onClick={() => moveFile(index, 'up')}
                          disabled={index === 0}
                          className="p-1 hover:bg-[var(--bg-surface)] rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <GripVertical className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="w-10 h-10 rounded-lg bg-[var(--primary-500)]/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-[var(--primary-500)]" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-[var(--text-primary)] truncate">
                          {pdfFile.name}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {pdfFile.pages} หน้า • {formatFileSize(pdfFile.size)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-[var(--text-muted)] bg-[var(--bg-surface)] px-2 py-1 rounded">
                          #{index + 1}
                        </span>
                        <button
                          onClick={() => openPreview(pdfFile.file)}
                          className="p-2 hover:bg-[var(--primary-500)]/10 rounded-lg text-[var(--primary-500)] transition-colors"
                          title="ดู Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeFile(pdfFile.id)}
                          className="p-2 hover:bg-[var(--error)]/10 rounded-lg text-[var(--error)] transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

          </div>

          {/* Right: Preview & Actions */}
          <div className="space-y-6">
            {/* Preview */}
            {pdfFiles.length > 0 && previewFile && (
              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-[var(--primary-500)]" />
                    Preview
                  </CardTitle>
                  <CardDescription>ดูตัวอย่างไฟล์</CardDescription>
                </CardHeader>
                <CardContent>
                  <PDFViewer file={previewFile} className="h-[400px]" />
                </CardContent>
              </Card>
            )}

            {/* Merge Button */}
            {pdfFiles.length >= 2 && (
              <Card variant="glass">
                <CardHeader>
                  <CardTitle>พร้อมรวมไฟล์</CardTitle>
                  <CardDescription>
                    {pdfFiles.length} ไฟล์ • {totalPages} หน้า
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={mergePDFs}
                    disabled={merging}
                    isLoading={merging}
                    className="w-full h-12"
                  >
                    <Download className="w-5 h-5" />
                    {merging ? 'กำลังรวม PDF...' : 'รวม PDF'}
                  </Button>

                  <div className="mt-4 p-3 rounded-lg bg-[var(--success)]/10 border border-[var(--success)]/20">
                    <p className="text-sm text-[var(--success)]">
                      ✓ พร้อมรวม {pdfFiles.length} ไฟล์
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Features */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {[
            { icon: "⚡", title: "รวดเร็ว", desc: "ประมวลผลบนเครื่องคุณ" },
            { icon: "🔒", title: "ปลอดภัย", desc: "ไม่ส่งข้อมูลออกไป" },
            { icon: "👁️", title: "ดู Preview", desc: "ตรวจสอบก่อนรวม" },
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



