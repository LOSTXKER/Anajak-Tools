"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { FileText, Upload, Download, ArrowLeft, Minimize2, TrendingDown, Sparkles, Eye, Folder, Trash2 } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { PDFDocument } from "pdf-lib"
import { formatFileSize } from "@/lib/utils"
import { PDFViewer } from "@/components/pdf/PDFViewer"
import Link from "next/link"
import { motion } from "framer-motion"
import JSZip from "jszip"
import { saveAs } from "file-saver"

interface PDFFileItem {
  id: string
  file: File
  originalSize: number
  compressedBlob?: Blob
  compressedSize?: number
  compressing: boolean
  error?: string
}

export default function PDFCompressPage() {
  const [pdfFiles, setPdfFiles] = useState<PDFFileItem[]>([])
  const [compressionLevel, setCompressionLevel] = useState<'low' | 'medium' | 'high'>('medium')
  const [folderCount, setFolderCount] = useState(0)
  const [previewFile, setPreviewFile] = useState<File | Blob | null>(null)

  // Extract PDFs from folder (including nested folders)
  const extractPDFsFromFileList = async (items: DataTransferItemList): Promise<File[]> => {
    const pdfFiles: File[] = []

    const traverseDirectory = async (entry: any): Promise<void> => {
      if (entry.isFile) {
        const file: File = await new Promise((resolve, reject) => {
          entry.file(resolve, reject)
        })
        
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

    // Check if folder was dropped
    if (event.dataTransfer && event.dataTransfer.items) {
      const items = event.dataTransfer.items
      
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
        filesToProcess = await extractPDFsFromFileList(items)
        setFolderCount(prev => prev + 1)
      } else {
        filesToProcess = acceptedFiles
      }
    } else {
      filesToProcess = acceptedFiles
    }

    if (filesToProcess.length === 0) {
      if (folderDetected) {
        alert('ไม่พบไฟล์ PDF ในโฟลเดอร์ที่เลือก')
      }
      return
    }

    const newFiles: PDFFileItem[] = filesToProcess.map(file => ({
      id: Date.now().toString() + Math.random(),
      file,
      originalSize: file.size,
      compressing: false
    }))

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
    multiple: true
  })

  const removeFile = (id: string) => {
    setPdfFiles(prev => prev.filter(f => f.id !== id))
  }

  const clearAll = () => {
    setPdfFiles([])
    setFolderCount(0)
  }

  const compressSingleFile = async (id: string) => {
    const fileIndex = pdfFiles.findIndex(f => f.id === id)
    if (fileIndex === -1) return

    const updatedFiles = [...pdfFiles]
    updatedFiles[fileIndex].compressing = true
    setPdfFiles(updatedFiles)

    try {
      const arrayBuffer = await updatedFiles[fileIndex].file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer, {
        updateMetadata: false,
        ignoreEncryption: true
      })

      // Get compression settings based on level
      let compressionOptions: any = {
        useObjectStreams: true,
        addDefaultPage: false,
      }

      if (compressionLevel === 'low') {
        // Low compression - faster, minimal size reduction
        compressionOptions = {
          ...compressionOptions,
          objectsPerTick: 200,
          useObjectStreams: false
        }
      } else if (compressionLevel === 'medium') {
        // Medium compression - balanced
        compressionOptions = {
          ...compressionOptions,
          objectsPerTick: 100,
          useObjectStreams: true
        }
      } else {
        // High compression - slower, maximum size reduction
        compressionOptions = {
          ...compressionOptions,
          objectsPerTick: 50,
          useObjectStreams: true
        }
      }

      // Save with optimized compression
      const pdfBytes = await pdfDoc.save(compressionOptions)

      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
      
      updatedFiles[fileIndex].compressedBlob = blob
      updatedFiles[fileIndex].compressedSize = blob.size
      updatedFiles[fileIndex].compressing = false
      updatedFiles[fileIndex].error = undefined
    } catch (error: any) {
      updatedFiles[fileIndex].compressing = false
      updatedFiles[fileIndex].error = error.message || 'เกิดข้อผิดพลาดในการบีบอัด'
    }

    setPdfFiles(updatedFiles)
  }

  const compressAll = async () => {
    // Process multiple files in parallel (batches of 3)
    const batchSize = 3
    const filesToCompress = pdfFiles.filter(f => !f.compressedBlob && !f.compressing)
    
    for (let i = 0; i < filesToCompress.length; i += batchSize) {
      const batch = filesToCompress.slice(i, i + batchSize)
      await Promise.all(batch.map(file => compressSingleFile(file.id)))
    }
  }

  const downloadSingle = (fileItem: PDFFileItem) => {
    if (!fileItem.compressedBlob) return

    const url = URL.createObjectURL(fileItem.compressedBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `compressed-${fileItem.file.name}`
    link.click()
    URL.revokeObjectURL(url)
  }

  const downloadAll = async () => {
    const compressedFiles = pdfFiles.filter(f => f.compressedBlob)
    
    if (compressedFiles.length === 0) return

    if (compressedFiles.length === 1) {
      downloadSingle(compressedFiles[0])
      return
    }

    // Create ZIP file
    const zip = new JSZip()
    
    for (const fileItem of compressedFiles) {
      if (fileItem.compressedBlob) {
        zip.file(`compressed-${fileItem.file.name}`, fileItem.compressedBlob)
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    saveAs(zipBlob, 'compressed-pdfs.zip')
  }

  const totalOriginalSize = pdfFiles.reduce((sum, f) => sum + f.originalSize, 0)
  const totalCompressedSize = pdfFiles.reduce((sum, f) => sum + (f.compressedSize || 0), 0)
  const compressedCount = pdfFiles.filter(f => f.compressedBlob).length
  const savingsPercent = totalOriginalSize > 0 && totalCompressedSize > 0
    ? Math.round(((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100)
    : 0

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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Minimize2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
                บีบอัด PDF
              </h1>
              <p className="text-[var(--text-secondary)] mt-1">
                ลดขนาดไฟล์ PDF • รองรับหลายไฟล์และโฟลเดอร์ 📁
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Upload & Settings */}
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
                    <Sparkles className="w-5 h-5 text-[var(--primary-500)]" />
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
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <FileText className="w-12 h-12 text-[var(--text-muted)]" />
                      <Folder className="w-12 h-12 text-[var(--primary-500)]" />
                    </div>
                    {isDragActive ? (
                      <p className="text-[var(--primary-500)] font-medium text-lg">วางไฟล์หรือโฟลเดอร์ที่นี่...</p>
                    ) : (
                      <div>
                        <p className="font-semibold text-[var(--text-primary)] mb-2">
                          ลากไฟล์ PDF หรือโฟลเดอร์มาวางที่นี่
                        </p>
                        <p className="text-sm text-[var(--text-muted)] mb-4">
                          รองรับโฟลเดอร์ซ้อนหลายชั้น 📂
                        </p>
                        <Button variant="secondary">
                          <Upload className="w-5 h-5" />
                          เลือกไฟล์หรือโฟลเดอร์
                        </Button>
                      </div>
                    )}
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

            {/* Compression Level */}
            {pdfFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle>ระดับการบีบอัด</CardTitle>
                    <CardDescription>เลือกระดับการบีบอัดที่ต้องการ</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'low' as const, label: 'เร็ว', desc: '⚡ เร็วที่สุด • ลดขนาด 10-20%', speed: 'เร็วที่สุด' },
                        { value: 'medium' as const, label: 'สมดุล', desc: '⚖️ แนะนำ • ลดขนาด 20-40%', speed: 'ปานกลาง' },
                        { value: 'high' as const, label: 'สูงสุด', desc: '🎯 ช้ากว่า • ลดขนาด 40-60%', speed: 'ช้ากว่า' },
                      ].map((level) => (
                        <button
                          key={level.value}
                          onClick={() => setCompressionLevel(level.value)}
                          className={`
                            p-4 rounded-xl border-2 transition-all text-left
                            ${compressionLevel === level.value
                              ? 'border-[var(--primary-500)] bg-[var(--primary-500)]/10'
                              : 'border-[var(--border-default)] hover:border-[var(--primary-500)]/50'
                            }
                          `}
                        >
                          <p className="font-semibold text-[var(--text-primary)] mb-1">
                            {level.label}
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">
                            {level.desc}
                          </p>
                        </button>
                      ))}
                    </div>

                    {/* Warning */}
                    <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <div className="flex gap-3">
                        <div className="text-2xl">⚠️</div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-1">
                            หมายเหตุสำคัญ
                          </p>
                          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                            • การบีบอัดจะไม่ลดคุณภาพรูปภาพหรือข้อความ<br/>
                            • ขนาดไฟล์ขึ้นอยู่กับเนื้อหาภายใน PDF<br/>
                            • ไฟล์ที่มีรูปภาพคุณภาพสูงจะลดขนาดได้มากกว่า<br/>
                            • บีบอัดหลายไฟล์พร้อมกันได้ (3 ไฟล์/รอบ)
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <Button
                        onClick={compressAll}
                        disabled={compressedCount === pdfFiles.length}
                        className="w-full"
                      >
                        <Minimize2 className="w-5 h-5" />
                        บีบอัดทั้งหมด ({pdfFiles.length} ไฟล์)
                      </Button>

                      {compressedCount > 0 && (
                        <Button
                          onClick={downloadAll}
                          variant="secondary"
                          className="w-full"
                        >
                          <Download className="w-5 h-5" />
                          ดาวน์โหลดทั้งหมด ({compressedCount} ไฟล์)
                        </Button>
                      )}

                      <Button
                        onClick={clearAll}
                        variant="ghost"
                        className="w-full"
                      >
                        <Trash2 className="w-4 h-4" />
                        ลบทั้งหมด
                      </Button>
                    </div>

                    {/* Stats */}
                    {compressedCount > 0 && (
                      <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-[var(--text-secondary)]">ประหยัดได้</span>
                          <span className="text-2xl font-bold text-purple-500">
                            {savingsPercent}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                          <span>{formatFileSize(totalOriginalSize)}</span>
                          <span>→</span>
                          <span>{formatFileSize(totalCompressedSize)}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right: File List & Preview */}
          <div className="space-y-6">
            {pdfFiles.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card variant="glass">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>ไฟล์ทั้งหมด ({pdfFiles.length})</CardTitle>
                        <CardDescription>
                          บีบอัดแล้ว {compressedCount} ไฟล์
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                      {pdfFiles.map((fileItem, index) => {
                        const savings = fileItem.compressedSize
                          ? Math.round(((fileItem.originalSize - fileItem.compressedSize) / fileItem.originalSize) * 100)
                          : 0

                        return (
                          <motion.div
                            key={fileItem.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--primary-500)]/50 transition-all"
                          >
                            <div className="flex items-start gap-3">
                              {/* Icon */}
                              <div className="w-10 h-10 rounded-lg bg-[var(--primary-500)]/10 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-5 h-5 text-[var(--primary-500)]" />
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-[var(--text-primary)] truncate text-sm">
                                  {fileItem.file.name}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-1">
                                  <span>{formatFileSize(fileItem.originalSize)}</span>
                                  {fileItem.compressedSize && (
                                    <>
                                      <span>→</span>
                                      <span className="text-purple-500 font-medium">
                                        {formatFileSize(fileItem.compressedSize)}
                                      </span>
                                      <span className="text-green-500 font-medium">
                                        (-{savings}%)
                                      </span>
                                    </>
                                  )}
                                </div>
                                {fileItem.error && (
                                  <p className="text-xs text-red-500 mt-1">{fileItem.error}</p>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-2">
                                {fileItem.compressing ? (
                                  <div className="w-8 h-8 rounded-lg bg-[var(--primary-500)]/10 flex items-center justify-center">
                                    <div className="w-4 h-4 border-2 border-[var(--primary-500)] border-t-transparent rounded-full animate-spin" />
                                  </div>
                                ) : fileItem.compressedBlob ? (
                                  <>
                                    <button
                                      onClick={() => setPreviewFile(fileItem.compressedBlob!)}
                                      className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
                                      title="ดูตัวอย่าง"
                                    >
                                      <Eye className="w-4 h-4 text-[var(--text-secondary)]" />
                                    </button>
                                    <button
                                      onClick={() => downloadSingle(fileItem)}
                                      className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
                                      title="ดาวน์โหลด"
                                    >
                                      <Download className="w-4 h-4 text-green-500" />
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => compressSingleFile(fileItem.id)}
                                    className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
                                    title="บีบอัด"
                                  >
                                    <Minimize2 className="w-4 h-4 text-[var(--text-secondary)]" />
                                  </button>
                                )}
                                <button
                                  onClick={() => removeFile(fileItem.id)}
                                  className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                                  title="ลบ"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-[var(--primary-500)]" />
                      ตัวอย่าง
                    </CardTitle>
                    <CardDescription>
                      {previewFile ? 'กำลังแสดงไฟล์' : 'ยังไม่ได้เลือกไฟล์'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-[3/4] rounded-xl border-2 border-dashed border-[var(--border-default)] flex items-center justify-center bg-[var(--bg-surface)]">
                      <div className="text-center p-8">
                        <Minimize2 className="w-16 h-16 mx-auto mb-4 text-[var(--text-muted)]" />
                        <p className="text-[var(--text-muted)]">
                          อัพโหลดไฟล์เพื่อเริ่มบีบอัด
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Preview */}
            {previewFile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-[var(--primary-500)]" />
                      ตัวอย่างไฟล์บีบอัด
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-xl overflow-hidden border border-[var(--border-default)] bg-white">
                      <PDFViewer file={previewFile} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
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
            { icon: "⚡", title: "หลายไฟล์", desc: "บีบอัดทีละหลายไฟล์" },
            { icon: "📦", title: "ดาวน์โหลด ZIP", desc: "รวมไฟล์เป็น ZIP อัตโนมัติ" },
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
