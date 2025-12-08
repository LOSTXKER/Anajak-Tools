"use client"

import { useState, useRef } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { FileText, Upload, Download, ArrowLeft, Image as ImageIcon, Sparkles, Eye } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { PDFDocument } from "pdf-lib"
import { PDFViewer } from "@/components/pdf/PDFViewer"
import Link from "next/link"
import { motion } from "framer-motion"
import JSZip from "jszip"
import { saveAs } from "file-saver"

export default function PDFToImagePage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [converting, setConverting] = useState(false)
  const [format, setFormat] = useState<'png' | 'jpeg'>('png')
  const [quality, setQuality] = useState(0.95)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setPdfFile(file)
    setImages([])
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  })

  const convertToImages = async () => {
    if (!pdfFile) return

    setConverting(true)
    setImages([])

    try {
      const arrayBuffer = await pdfFile.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const pageCount = pdfDoc.getPageCount()
      const convertedImages: string[] = []

      // Note: This is a simplified version
      // For full PDF rendering, you'd need pdf.js or similar library
      // Here we'll create placeholder images with page info
      for (let i = 0; i < pageCount; i++) {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) continue

        // Create a simple placeholder image
        canvas.width = 800
        canvas.height = 1000
        
        // White background
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // Draw border
        ctx.strokeStyle = '#cccccc'
        ctx.lineWidth = 2
        ctx.strokeRect(0, 0, canvas.width, canvas.height)
        
        // Draw text
        ctx.fillStyle = '#333333'
        ctx.font = '48px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(`Page ${i + 1} of ${pageCount}`, canvas.width / 2, canvas.height / 2 - 50)
        
        ctx.font = '24px Arial'
        ctx.fillStyle = '#666666'
        ctx.fillText(pdfFile.name, canvas.width / 2, canvas.height / 2 + 20)
        ctx.fillText('(Preview - Install pdf.js for full rendering)', canvas.width / 2, canvas.height / 2 + 60)

        const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png'
        const imageData = canvas.toDataURL(mimeType, quality)
        convertedImages.push(imageData)
      }

      setImages(convertedImages)
    } catch (error) {
      console.error('Error converting PDF:', error)
      alert('เกิดข้อผิดพลาดในการแปลง PDF กรุณาลองใหม่อีกครั้ง')
    } finally {
      setConverting(false)
    }
  }

  const downloadSingle = (imageData: string, index: number) => {
    const link = document.createElement('a')
    link.download = `${pdfFile?.name.replace('.pdf', '')}-page-${index + 1}.${format}`
    link.href = imageData
    link.click()
  }

  const downloadAll = async () => {
    if (images.length === 0) return

    const zip = new JSZip()
    const fileName = pdfFile?.name.replace('.pdf', '') || 'document'

    images.forEach((imageData, index) => {
      const base64Data = imageData.split(',')[1]
      zip.file(`${fileName}-page-${index + 1}.${format}`, base64Data, { base64: true })
    })

    const blob = await zip.generateAsync({ type: 'blob' })
    saveAs(blob, `${fileName}-images.zip`)
  }

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="container mx-auto max-w-6xl">
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
              <ImageIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
                PDF เป็นรูปภาพ
              </h1>
              <p className="text-[var(--text-secondary)] mt-1">
                แปลงหน้า PDF เป็นรูปภาพ PNG หรือ JPEG
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                  อัพโหลดไฟล์ PDF
                </CardTitle>
                <CardDescription>เลือกไฟล์ PDF ที่ต้องการแปลง</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  {...getRootProps()}
                  className={`
                    border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all
                    ${isDragActive 
                      ? 'border-[var(--primary-500)] bg-[var(--primary-500)]/5' 
                      : 'border-[var(--border-default)] hover:border-[var(--primary-500)]'
                    }
                  `}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-16 h-16 mx-auto mb-4 text-[var(--text-muted)]" />
                  {isDragActive ? (
                    <p className="text-[var(--primary-500)] font-medium text-lg">วางไฟล์ PDF ที่นี่...</p>
                  ) : (
                    <div>
                      <p className="font-semibold text-[var(--text-primary)] mb-2 text-lg">
                        ลากไฟล์ PDF มาวางที่นี่
                      </p>
                      <p className="text-sm text-[var(--text-muted)] mb-4">
                        หรือคลิกเพื่อเลือกไฟล์
                      </p>
                      <Button variant="secondary" size="sm">
                        เลือกไฟล์ PDF
                      </Button>
                    </div>
                  )}
                </div>

                {pdfFile && (
                  <motion.div 
                    className="mt-4 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)]"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[var(--primary-500)]/10 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-[var(--primary-500)]" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-[var(--text-primary)]">
                          {pdfFile.name}
                        </p>
                        <p className="text-sm text-[var(--text-muted)]">
                          {(pdfFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>


            {/* Settings */}
            {pdfFile && images.length === 0 && (
              <Card variant="glass">
                <CardHeader>
                  <CardTitle>ตั้งค่า</CardTitle>
                  <CardDescription>เลือกรูปแบบและคุณภาพ</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Format */}
                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-primary)] mb-3">
                      รูปแบบ
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'png', label: 'PNG', desc: 'คุณภาพสูง' },
                        { value: 'jpeg', label: 'JPEG', desc: 'ขนาดเล็ก' },
                      ].map((f) => (
                        <label
                          key={f.value}
                          className={`
                            flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all
                            ${format === f.value
                              ? 'bg-[var(--primary-500)]/10 border-2 border-[var(--primary-500)]'
                              : 'glass border border-[var(--glass-border)] hover:border-[var(--primary-500)]'
                            }
                          `}
                        >
                          <input
                            type="radio"
                            name="format"
                            value={f.value}
                            checked={format === f.value}
                            onChange={() => setFormat(f.value as any)}
                            className="w-5 h-5 accent-[var(--primary-500)]"
                          />
                          <div className="flex-1">
                            <p className="font-bold text-[var(--text-primary)]">
                              {f.label}
                            </p>
                            <p className="text-xs text-[var(--text-secondary)]">
                              {f.desc}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Quality (for JPEG) */}
                  {format === 'jpeg' && (
                    <div>
                      <label className="block text-sm font-semibold text-[var(--text-primary)] mb-3">
                        คุณภาพ: <span className="text-[var(--primary-500)]">{Math.round(quality * 100)}%</span>
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="1"
                        step="0.05"
                        value={quality}
                        onChange={(e) => setQuality(Number(e.target.value))}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, var(--primary-500) 0%, var(--primary-500) ${quality * 100}%, var(--bg-elevated) ${quality * 100}%, var(--bg-elevated) 100%)`
                        }}
                      />
                    </div>
                  )}

                  <Button
                    onClick={convertToImages}
                    disabled={converting}
                    isLoading={converting}
                    className="w-full h-12"
                  >
                    <ImageIcon className="w-5 h-5" />
                    {converting ? 'กำลังแปลง...' : 'แปลงเป็นรูปภาพ'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Preview & Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* PDF Preview */}
            {pdfFile && !images.length && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-[var(--primary-500)]" />
                      ตัวอย่าง PDF
                    </CardTitle>
                    <CardDescription>ดูไฟล์ก่อนแปลง</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PDFViewer file={pdfFile} className="h-[500px]" />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Results */}
            {images.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card variant="glass">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>ผลลัพธ์</CardTitle>
                      <CardDescription>
                        แปลงแล้ว {images.length} หน้า
                      </CardDescription>
                    </div>
                    <Button onClick={downloadAll} variant="primary">
                      <Download className="w-5 h-5" />
                      ดาวน์โหลดทั้งหมด (ZIP)
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((imageData, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="group relative"
                      >
                        <div className="aspect-[3/4] rounded-xl overflow-hidden border-2 border-[var(--border-default)] bg-white">
                          <img
                            src={imageData}
                            alt={`Page ${index + 1}`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <p className="text-sm font-medium text-[var(--text-primary)]">
                            หน้า {index + 1}
                          </p>
                          <Button
                            onClick={() => downloadSingle(imageData, index)}
                            variant="ghost"
                            size="sm"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Button
                      onClick={() => {
                        setPdfFile(null)
                        setImages([])
                      }}
                      variant="secondary"
                      className="flex-1"
                    >
                      แปลงไฟล์ใหม่
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Note */}
        <motion.div 
          className="mt-10 p-6 rounded-2xl glass border border-[var(--glass-border)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-bold text-[var(--text-primary)] mb-3">
            ℹ️ หมายเหตุ
          </h3>
          <p className="text-sm text-[var(--text-secondary)]">
            เวอร์ชันนี้เป็น Preview - สำหรับการแปลงที่สมบูรณ์ ควรติดตั้ง pdf.js library เพิ่มเติม
            ปัจจุบันแสดง placeholder ของแต่ละหน้า
          </p>
        </motion.div>
      </div>
    </div>
  )
}



