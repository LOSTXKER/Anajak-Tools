"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { FileText, Upload, Download, ArrowLeft, Image as ImageIcon, Sparkles, Folder, Trash2, Eye } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { formatFileSize } from "@/lib/utils"
import Link from "next/link"
import { motion } from "framer-motion"
import JSZip from "jszip"
import { saveAs } from "file-saver"

interface PDFFileItem {
  id: string
  file: File
  images: string[]
  converting: boolean
  error?: string
}

export default function PDFToImagePage() {
  const [pdfFiles, setPdfFiles] = useState<PDFFileItem[]>([])
  const [format, setFormat] = useState<'png' | 'jpeg'>('png')
  const [quality, setQuality] = useState(0.95)
  const [scale, setScale] = useState(2.0)
  const [folderCount, setFolderCount] = useState(0)

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
      images: [],
      converting: false
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

  const convertSingleFile = async (id: string) => {
    const fileIndex = pdfFiles.findIndex(f => f.id === id)
    if (fileIndex === -1) return

    const updatedFiles = [...pdfFiles]
    updatedFiles[fileIndex].converting = true
    setPdfFiles(updatedFiles)

    try {
      // Dynamic import pdf.js
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

      const arrayBuffer = await updatedFiles[fileIndex].file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const convertedImages: string[] = []

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum)
        const viewport = page.getViewport({ scale })

        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        if (!context) continue

        canvas.width = viewport.width
        canvas.height = viewport.height

        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        } as any).promise

        const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png'
        const imageData = canvas.toDataURL(mimeType, quality)
        convertedImages.push(imageData)
      }

      updatedFiles[fileIndex].images = convertedImages
      updatedFiles[fileIndex].converting = false
      updatedFiles[fileIndex].error = undefined
    } catch (error: any) {
      updatedFiles[fileIndex].converting = false
      updatedFiles[fileIndex].error = error.message
    }

    setPdfFiles(updatedFiles)
  }

  const convertAll = async () => {
    for (const file of pdfFiles) {
      if (file.images.length === 0 && !file.converting) {
        await convertSingleFile(file.id)
      }
    }
  }

  const downloadSingleImage = (imageData: string, fileName: string, pageNumber: number) => {
    const link = document.createElement('a')
    link.download = `${fileName.replace('.pdf', '')}-page-${pageNumber}.${format}`
    link.href = imageData
    link.click()
  }

  const downloadFileImages = async (fileItem: PDFFileItem) => {
    if (fileItem.images.length === 0) return

    if (fileItem.images.length === 1) {
      downloadSingleImage(fileItem.images[0], fileItem.file.name, 1)
      return
    }

    // Create ZIP
    const zip = new JSZip()
    const folder = zip.folder(fileItem.file.name.replace('.pdf', ''))

    for (let i = 0; i < fileItem.images.length; i++) {
      const base64Data = fileItem.images[i].split(',')[1]
      folder?.file(`page-${i + 1}.${format}`, base64Data, { base64: true })
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    saveAs(zipBlob, `${fileItem.file.name.replace('.pdf', '')}-images.zip`)
  }

  const downloadAll = async () => {
    const convertedFiles = pdfFiles.filter(f => f.images.length > 0)
    
    if (convertedFiles.length === 0) return

    if (convertedFiles.length === 1) {
      await downloadFileImages(convertedFiles[0])
      return
    }

    // Create master ZIP
    const zip = new JSZip()

    for (const fileItem of convertedFiles) {
      const folder = zip.folder(fileItem.file.name.replace('.pdf', ''))
      
      for (let i = 0; i < fileItem.images.length; i++) {
        const base64Data = fileItem.images[i].split(',')[1]
        folder?.file(`page-${i + 1}.${format}`, base64Data, { base64: true })
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    saveAs(zipBlob, 'all-pdf-images.zip')
  }

  const convertedCount = pdfFiles.filter(f => f.images.length > 0).length
  const totalImages = pdfFiles.reduce((sum, f) => sum + f.images.length, 0)

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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ImageIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
                PDF เป็นรูปภาพ
              </h1>
              <p className="text-[var(--text-secondary)] mt-1">
                แปลง PDF เป็น PNG/JPEG • รองรับหลายไฟล์และโฟลเดอร์ 📁
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Upload & Settings */}
          <div className="space-y-6">
            {/* Upload */}
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

            {/* Settings */}
            {pdfFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle>การตั้งค่า</CardTitle>
                    <CardDescription>ปรับแต่งการแปลงรูปภาพ</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Format */}
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                        รูปแบบไฟล์
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'png' as const, label: 'PNG', desc: 'คุณภาพสูง' },
                          { value: 'jpeg' as const, label: 'JPEG', desc: 'ไฟล์เล็ก' },
                        ].map((fmt) => (
                          <button
                            key={fmt.value}
                            onClick={() => setFormat(fmt.value)}
                            className={`
                              p-3 rounded-xl border-2 transition-all text-left
                              ${format === fmt.value
                                ? 'border-[var(--primary-500)] bg-[var(--primary-500)]/10'
                                : 'border-[var(--border-default)] hover:border-[var(--primary-500)]/50'
                              }
                            `}
                          >
                            <p className="font-semibold text-[var(--text-primary)]">
                              {fmt.label}
                            </p>
                            <p className="text-xs text-[var(--text-muted)]">
                              {fmt.desc}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quality */}
                    {format === 'jpeg' && (
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                          คุณภาพ: {Math.round(quality * 100)}%
                        </label>
                        <input
                          type="range"
                          min="0.5"
                          max="1"
                          step="0.05"
                          value={quality}
                          onChange={(e) => setQuality(parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    )}

                    {/* Scale */}
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                        ความละเอียด: {scale}x
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="3"
                        step="0.5"
                        value={scale}
                        onChange={(e) => setScale(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    {/* Actions */}
                    <div className="space-y-3 pt-4">
                      <Button
                        onClick={convertAll}
                        disabled={convertedCount === pdfFiles.length}
                        className="w-full"
                      >
                        <ImageIcon className="w-5 h-5" />
                        แปลงทั้งหมด ({pdfFiles.length} ไฟล์)
                      </Button>

                      {convertedCount > 0 && (
                        <Button
                          onClick={downloadAll}
                          variant="secondary"
                          className="w-full"
                        >
                          <Download className="w-5 h-5" />
                          ดาวน์โหลดทั้งหมด ({totalImages} รูป)
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
                    {convertedCount > 0 && (
                      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                        <div className="text-center">
                          <p className="text-3xl font-bold text-blue-500 mb-1">
                            {totalImages}
                          </p>
                          <p className="text-sm text-[var(--text-muted)]">
                            รูปภาพที่แปลงแล้ว
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right: File List & Results */}
          <div className="space-y-6">
            {pdfFiles.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle>ไฟล์ทั้งหมด ({pdfFiles.length})</CardTitle>
                    <CardDescription>
                      แปลงแล้ว {convertedCount} ไฟล์ • {totalImages} รูป
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-[700px] overflow-y-auto">
                      {pdfFiles.map((fileItem, index) => (
                        <motion.div
                          key={fileItem.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)]"
                        >
                          {/* File Header */}
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-[var(--primary-500)]/10 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5 text-[var(--primary-500)]" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-[var(--text-primary)] truncate">
                                {fileItem.file.name}
                              </p>
                              <p className="text-xs text-[var(--text-muted)]">
                                {formatFileSize(fileItem.file.size)}
                                {fileItem.images.length > 0 && (
                                  <span className="ml-2 text-blue-500 font-medium">
                                    • {fileItem.images.length} รูป
                                  </span>
                                )}
                              </p>
                              {fileItem.error && (
                                <p className="text-xs text-red-500 mt-1">{fileItem.error}</p>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              {fileItem.converting ? (
                                <div className="w-8 h-8 rounded-lg bg-[var(--primary-500)]/10 flex items-center justify-center">
                                  <div className="w-4 h-4 border-2 border-[var(--primary-500)] border-t-transparent rounded-full animate-spin" />
                                </div>
                              ) : fileItem.images.length > 0 ? (
                                <button
                                  onClick={() => downloadFileImages(fileItem)}
                                  className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
                                  title="ดาวน์โหลด"
                                >
                                  <Download className="w-4 h-4 text-green-500" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => convertSingleFile(fileItem.id)}
                                  className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
                                  title="แปลง"
                                >
                                  <ImageIcon className="w-4 h-4 text-[var(--text-secondary)]" />
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

                          {/* Image Gallery */}
                          {fileItem.images.length > 0 && (
                            <div className="grid grid-cols-3 gap-2">
                              {fileItem.images.map((img, imgIndex) => (
                                <div
                                  key={imgIndex}
                                  className="aspect-[3/4] rounded-lg overflow-hidden border border-[var(--border-default)] bg-white cursor-pointer hover:opacity-75 transition-opacity"
                                  onClick={() => downloadSingleImage(img, fileItem.file.name, imgIndex + 1)}
                                >
                                  <img
                                    src={img}
                                    alt={`Page ${imgIndex + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      ))}
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
                      <ImageIcon className="w-5 h-5 text-[var(--primary-500)]" />
                      ผลลัพธ์
                    </CardTitle>
                    <CardDescription>รูปภาพที่แปลงจะแสดงที่นี่</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-[3/4] rounded-xl border-2 border-dashed border-[var(--border-default)] flex items-center justify-center bg-[var(--bg-surface)]">
                      <div className="text-center p-8">
                        <ImageIcon className="w-16 h-16 mx-auto mb-4 text-[var(--text-muted)]" />
                        <p className="text-[var(--text-muted)]">
                          อัพโหลดไฟล์เพื่อเริ่มแปลง
                        </p>
                      </div>
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
            { icon: "🖼️", title: "หลายรูปแบบ", desc: "PNG หรือ JPEG" },
            { icon: "📦", title: "ZIP อัตโนมัติ", desc: "รวมรูปเป็น ZIP" },
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
