"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { FileText, Upload, Download, Trash2, GripVertical, Eye, Folder, ArrowLeft } from "lucide-react"
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
  path?: string  // เก็บ path ของไฟล์
}

export default function PDFMergePage() {
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([])
  const [merging, setMerging] = useState(false)
  const [previewFile, setPreviewFile] = useState<File | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [folderCount, setFolderCount] = useState(0)

  // ฟังก์ชันสำหรับดึงไฟล์ PDF จากโฟลเดอร์ (รวมโฟลเดอร์ย่อย)
  const extractPDFsFromFileList = async (items: DataTransferItemList): Promise<File[]> => {
    const pdfFiles: File[] = []

    const traverseDirectory = async (entry: any): Promise<void> => {
      if (entry.isFile) {
        const file: File = await new Promise((resolve, reject) => {
          entry.file(resolve, reject)
        })
        
        // เช็คว่าเป็นไฟล์ PDF หรือไม่
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
          pdfFiles.push(file)
        }
      } else if (entry.isDirectory) {
        const dirReader = entry.createReader()
        const entries: any[] = await new Promise((resolve, reject) => {
          dirReader.readEntries(resolve, reject)
        })
        
        for (const childEntry of entries) {
          await traverseDirectory(childEntry)
        }
      }
    }

    // วนลูปผ่านทุก item
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.kind === 'file') {
        const entry = item.webkitGetAsEntry()
        if (entry) {
          await traverseDirectory(entry)
        }
      }
    }

    return pdfFiles
  }

  const onDrop = async (acceptedFiles: File[], fileRejections: any, event: any) => {
    let filesToProcess: File[] = []
    let folderDetected = false

    // ตรวจสอบว่ามีการลากโฟลเดอร์หรือไม่
    if (event.dataTransfer && event.dataTransfer.items) {
      const items = event.dataTransfer.items
      
      // เช็คว่ามีโฟลเดอร์หรือไม่
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.kind === 'file') {
          const entry = item.webkitGetAsEntry()
          if (entry && entry.isDirectory) {
            folderDetected = true
            break
          }
        }
      }

      if (folderDetected) {
        // ถ้าเป็นโฟลเดอร์ ให้ดึงไฟล์ PDF ทั้งหมดออกมา
        filesToProcess = await extractPDFsFromFileList(items)
        setFolderCount(prev => prev + 1)
      } else {
        // ถ้าไม่ใช่โฟลเดอร์ ใช้ไฟล์ที่ได้รับตามปกติ
        filesToProcess = acceptedFiles
      }
    } else {
      // Fallback: ใช้ไฟล์ที่ได้รับตามปกติ
      filesToProcess = acceptedFiles
    }

    if (filesToProcess.length === 0) {
      if (folderDetected) {
        alert('ไม่พบไฟล์ PDF ในโฟลเดอร์ที่เลือก')
      }
      return
    }

    const newFiles: PDFFile[] = []
    
    for (const file of filesToProcess) {
      // Get page count
      let pages = 0
      try {
        const arrayBuffer = await file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer)
        pages = pdfDoc.getPageCount()
      } catch (error) {
        console.error('Error reading PDF:', error)
      }

      // ดึง path จาก webkitRelativePath ถ้ามี
      const path = (file as any).webkitRelativePath || file.name

      newFiles.push({
        id: Date.now().toString() + Math.random(),
        file,
        name: file.name,
        size: file.size,
        pages,
        path
      })
    }
    
    setPdfFiles(prev => [...prev, ...newFiles])
    
    if (folderDetected) {
      alert(`พบ ${filesToProcess.length} ไฟล์ PDF ในโฟลเดอร์`)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true,
    // เปิดการรับโฟลเดอร์
    useFsAccessApi: false,
  })

  const removeFile = (id: string) => {
    setPdfFiles(prev => prev.filter(f => f.id !== id))
  }

  const clearAll = () => {
    setPdfFiles([])
    setFolderCount(0)
  }

  const mergePDFs = async () => {
    if (pdfFiles.length < 2) return

    setMerging(true)
    
    try {
      const mergedPdf = await PDFDocument.create()

      for (const pdfFile of pdfFiles) {
        const arrayBuffer = await pdfFile.file.arrayBuffer()
        const pdf = await PDFDocument.load(arrayBuffer, {
          updateMetadata: false,
          ignoreEncryption: true
        })
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
        copiedPages.forEach((page) => mergedPdf.addPage(page))
      }

      // Save with optimization to preserve quality
      const mergedPdfBytes = await mergedPdf.save({
        useObjectStreams: false, // Preserve quality
        addDefaultPage: false
      })
      
      const blob = new Blob([new Uint8Array(mergedPdfBytes)], { type: 'application/pdf' })
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
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    
    if (targetIndex < 0 || targetIndex >= newFiles.length) return
    
    [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]]
    setPdfFiles(newFiles)
  }

  const togglePreview = (file: File | null) => {
    setPreviewFile(file)
    setShowPreview(!!file)
  }

  const totalPages = pdfFiles.reduce((sum, file) => sum + (file.pages || 0), 0)

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="container mx-auto max-w-7xl">
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
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
                รวม PDF
              </h1>
              <p className="text-[var(--text-secondary)] mt-1">
                รวมหลายไฟล์ PDF เป็นไฟล์เดียว • รองรับการลากโฟลเดอร์ 📁
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Upload & File List */}
          <div className="space-y-6">
            {/* Upload Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-[var(--primary-500)]" />
                    อัพโหลด PDF
                  </CardTitle>
                  <CardDescription>ลากไฟล์ หรือ โฟลเดอร์ มาวางที่นี่</CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    {...getRootProps()}
                    className={`
                      border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
                      ${isDragActive 
                        ? 'border-[var(--primary-500)] bg-[var(--primary-500)]/5' 
                        : 'border-[var(--border-default)] hover:border-[var(--primary-500)]'
                      }
                    `}
                  >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-12 h-12 text-[var(--text-muted)]" />
                        <Folder className="w-12 h-12 text-[var(--primary-500)]" />
                      </div>
                      {isDragActive ? (
                        <p className="text-[var(--primary-500)] font-medium text-lg">
                          วางไฟล์หรือโฟลเดอร์ที่นี่...
                        </p>
                      ) : (
                        <div>
                          <p className="font-semibold text-[var(--text-primary)] mb-2">
                            ลากไฟล์ PDF หรือโฟลเดอร์มาวางที่นี่
                          </p>
                          <p className="text-sm text-[var(--text-muted)] mb-4">
                            รองรับโฟลเดอร์ซ้อนหลายชั้น 📂📂📂
                          </p>
                          <Button variant="secondary">
                            <Upload className="w-5 h-5" />
                            เลือกไฟล์หรือโฟลเดอร์
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Folder Info */}
                  {folderCount > 0 && (
                    <div className="mt-4 p-3 rounded-lg bg-[var(--primary-500)]/10 border border-[var(--primary-500)]/20">
                      <div className="flex items-center gap-2 text-[var(--primary-500)]">
                        <Folder className="w-5 h-5" />
                        <span className="text-sm font-medium">
                          ได้รับไฟล์จาก {folderCount} โฟลเดอร์
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* File List */}
            {pdfFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card variant="glass">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>ไฟล์ที่เลือก ({pdfFiles.length} ไฟล์)</CardTitle>
                        <CardDescription>รวม {totalPages} หน้า</CardDescription>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={clearAll}
                      >
                        <Trash2 className="w-4 h-4" />
                        ลบทั้งหมด
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {pdfFiles.map((pdfFile, index) => (
                        <motion.div
                          key={pdfFile.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border-default)] hover:border-[var(--primary-500)]/50 transition-all bg-[var(--bg-surface)]"
                        >
                          {/* Drag Handle */}
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => moveFile(index, 'up')}
                              disabled={index === 0}
                              className="p-1 hover:bg-[var(--bg-hover)] rounded disabled:opacity-30"
                            >
                              <GripVertical className="w-4 h-4 text-[var(--text-muted)] rotate-90" />
                            </button>
                            <button
                              onClick={() => moveFile(index, 'down')}
                              disabled={index === pdfFiles.length - 1}
                              className="p-1 hover:bg-[var(--bg-hover)] rounded disabled:opacity-30"
                            >
                              <GripVertical className="w-4 h-4 text-[var(--text-muted)] -rotate-90" />
                            </button>
                          </div>

                          {/* File Icon */}
                          <div className="w-10 h-10 rounded-lg bg-[var(--primary-500)]/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-[var(--primary-500)]" />
                          </div>

                          {/* File Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-[var(--text-primary)] truncate">
                              {pdfFile.name}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                              <span>{formatFileSize(pdfFile.size)}</span>
                              {pdfFile.pages && (
                                <>
                                  <span>•</span>
                                  <span>{pdfFile.pages} หน้า</span>
                                </>
                              )}
                            </div>
                            {/* Show path if it's from a folder */}
                            {pdfFile.path && pdfFile.path !== pdfFile.name && (
                              <p className="text-xs text-[var(--text-muted)] truncate mt-1 flex items-center gap-1">
                                <Folder className="w-3 h-3" />
                                {pdfFile.path}
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => togglePreview(pdfFile.file)}
                              className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
                              title="ดูตัวอย่าง"
                            >
                              <Eye className="w-4 h-4 text-[var(--text-secondary)]" />
                            </button>
                            <button
                              onClick={() => removeFile(pdfFile.id)}
                              className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="ลบ"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Merge Button */}
                    <div className="mt-6 pt-4 border-t border-[var(--border-default)]">
                      <Button
                        onClick={mergePDFs}
                        disabled={pdfFiles.length < 2 || merging}
                        isLoading={merging}
                        className="w-full"
                        size="lg"
                      >
                        <Download className="w-5 h-5" />
                        {merging ? 'กำลังรวม PDF...' : `รวม ${pdfFiles.length} ไฟล์`}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right: Preview */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-[var(--primary-500)]" />
                    ตัวอย่าง PDF
                  </CardTitle>
                  <CardDescription>
                    {previewFile ? `กำลังแสดง: ${previewFile.name}` : 'คลิกไอคอน 👁️ เพื่อดูตัวอย่าง'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {previewFile ? (
                    <div className="rounded-xl overflow-hidden border border-[var(--border-default)] bg-white">
                      <PDFViewer file={previewFile} />
                    </div>
                  ) : (
                    <div className="aspect-[3/4] rounded-xl border-2 border-dashed border-[var(--border-default)] flex items-center justify-center bg-[var(--bg-surface)]">
                      <div className="text-center p-8">
                        <Eye className="w-16 h-16 mx-auto mb-4 text-[var(--text-muted)]" />
                        <p className="text-[var(--text-muted)]">
                          ยังไม่ได้เลือกไฟล์
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Features */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {[
            { icon: "📁", title: "รองรับโฟลเดอร์", desc: "ลากโฟลเดอร์เข้ามาได้เลย" },
            { icon: "🗂️", title: "ซ้อนหลายชั้น", desc: "หาไฟล์ในโฟลเดอร์ย่อยอัตโนมัติ" },
            { icon: "🔀", title: "จัดเรียง", desc: "เลือกลำดับได้ตามต้องการ" },
            { icon: "👁️", title: "Preview", desc: "ดูตัวอย่างก่อนรวม" },
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
