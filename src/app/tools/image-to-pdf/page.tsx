"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { FileText, Upload, Download, ArrowLeft, Image as ImageIcon, Sparkles, X } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { PDFDocument } from "pdf-lib"
import Link from "next/link"
import { motion } from "framer-motion"

export default function ImageToPDFPage() {
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [converting, setConverting] = useState(false)
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'auto'>('auto')

  const onDrop = (acceptedFiles: File[]) => {
    setImages([...images, ...acceptedFiles])
    
    // Create previews
    acceptedFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviews(prev => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif']
    },
    multiple: true
  })

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
    setPreviews(previews.filter((_, i) => i !== index))
  }

  const convertToPDF = async () => {
    if (images.length === 0) return

    setConverting(true)

    try {
      const pdfDoc = await PDFDocument.create()

      for (const image of images) {
        const arrayBuffer = await image.arrayBuffer()
        
        let embeddedImage
        if (image.type === 'image/png') {
          embeddedImage = await pdfDoc.embedPng(arrayBuffer)
        } else if (image.type === 'image/jpeg' || image.type === 'image/jpg') {
          embeddedImage = await pdfDoc.embedJpg(arrayBuffer)
        } else {
          // Convert other formats to JPEG first
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          const img = new Image()
          
          await new Promise((resolve) => {
            img.onload = resolve
            img.src = URL.createObjectURL(image)
          })
          
          canvas.width = img.width
          canvas.height = img.height
          ctx?.drawImage(img, 0, 0)
          
          const jpegData = canvas.toDataURL('image/jpeg', 0.95)
          const base64Data = jpegData.split(',')[1]
          const binaryData = atob(base64Data)
          const bytes = new Uint8Array(binaryData.length)
          for (let i = 0; i < binaryData.length; i++) {
            bytes[i] = binaryData.charCodeAt(i)
          }
          embeddedImage = await pdfDoc.embedJpg(bytes)
        }

        const { width, height } = embeddedImage
        
        // Determine page size
        let pageWidth, pageHeight
        if (pageSize === 'a4') {
          pageWidth = 595 // A4 width in points
          pageHeight = 842 // A4 height in points
        } else if (pageSize === 'letter') {
          pageWidth = 612 // Letter width
          pageHeight = 792 // Letter height
        } else {
          // Auto - use image dimensions
          pageWidth = width
          pageHeight = height
        }

        // Calculate scaling
        const scale = Math.min(pageWidth / width, pageHeight / height)
        const scaledWidth = width * scale
        const scaledHeight = height * scale

        const page = pdfDoc.addPage([pageWidth, pageHeight])
        
        // Center the image
        const x = (pageWidth - scaledWidth) / 2
        const y = (pageHeight - scaledHeight) / 2
        
        page.drawImage(embeddedImage, {
          x,
          y,
          width: scaledWidth,
          height: scaledHeight,
        })
      }

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = 'images-to-pdf.pdf'
      link.click()
      
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error converting to PDF:', error)
      alert('เกิดข้อผิดพลาดในการแปลง กรุณาลองใหม่อีกครั้ง')
    } finally {
      setConverting(false)
    }
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
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
                รูปภาพเป็น PDF
              </h1>
              <p className="text-[var(--text-secondary)] mt-1">
                แปลงรูปภาพหลายรูปเป็นไฟล์ PDF เดียว
              </p>
            </div>
          </div>
        </motion.div>

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
                  อัพโหลดรูปภาพ
                </CardTitle>
                <CardDescription>เลือกรูปภาพที่ต้องการแปลงเป็น PDF (รองรับหลายไฟล์)</CardDescription>
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
                    <p className="text-[var(--primary-500)] font-medium text-lg">วางรูปภาพที่นี่...</p>
                  ) : (
                    <div>
                      <p className="font-semibold text-[var(--text-primary)] mb-2 text-lg">
                        ลากรูปภาพมาวางที่นี่
                      </p>
                      <p className="text-sm text-[var(--text-muted)] mb-4">
                        หรือคลิกเพื่อเลือกไฟล์ (PNG, JPG, WebP, GIF)
                      </p>
                      <Button variant="secondary" size="sm">
                        เลือกรูปภาพ
                      </Button>
                    </div>
                  )}
                </div>

                {/* Image Previews */}
                {images.length > 0 && (
                  <motion.div 
                    className="mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        รูปภาพทั้งหมด ({images.length})
                      </p>
                      <Button
                        onClick={() => {
                          setImages([])
                          setPreviews([])
                        }}
                        variant="ghost"
                        size="sm"
                      >
                        ลบทั้งหมด
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {previews.map((preview, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative group"
                        >
                          <div className="aspect-square rounded-lg overflow-hidden border-2 border-[var(--border-default)] bg-white">
                            <img
                              src={preview}
                              alt={`Image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[var(--error)] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <p className="text-xs text-center text-[var(--text-muted)] mt-1">
                            {index + 1}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Settings */}
          {images.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card variant="glass">
                <CardHeader>
                  <CardTitle>ตั้งค่า</CardTitle>
                  <CardDescription>เลือกขนาดหน้ากระดาษ</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'auto', label: 'Auto', desc: 'ตามขนาดรูป' },
                      { value: 'a4', label: 'A4', desc: '210×297 mm' },
                      { value: 'letter', label: 'Letter', desc: '8.5×11 in' },
                    ].map((size) => (
                      <label
                        key={size.value}
                        className={`
                          p-4 rounded-xl cursor-pointer transition-all text-center
                          ${pageSize === size.value
                            ? 'bg-[var(--primary-500)]/10 border-2 border-[var(--primary-500)]'
                            : 'glass border border-[var(--glass-border)] hover:border-[var(--primary-500)]'
                          }
                        `}
                      >
                        <input
                          type="radio"
                          name="pageSize"
                          value={size.value}
                          checked={pageSize === size.value}
                          onChange={() => setPageSize(size.value as any)}
                          className="hidden"
                        />
                        <p className="font-bold text-[var(--text-primary)] mb-1">
                          {size.label}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {size.desc}
                        </p>
                      </label>
                    ))}
                  </div>

                  <Button
                    onClick={convertToPDF}
                    disabled={converting || images.length === 0}
                    isLoading={converting}
                    className="w-full h-12"
                  >
                    <FileText className="w-5 h-5" />
                    {converting ? 'กำลังแปลง...' : 'สร้าง PDF'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Features */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {[
            { icon: "📄", title: "หลายรูปใน PDF เดียว", desc: "รวมรูปภาพหลายรูปเป็น PDF" },
            { icon: "📐", title: "ปรับขนาดอัตโนมัติ", desc: "ปรับให้พอดีกับหน้ากระดาษ" },
            { icon: "🔒", title: "ปลอดภัย", desc: "ประมวลผลบนเครื่องคุณ" },
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



