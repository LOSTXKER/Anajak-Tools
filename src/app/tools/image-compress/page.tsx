"use client"

import { useState, useRef } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Image as ImageIcon, Upload, Download, ArrowLeft, Minimize2, TrendingDown, Sparkles } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { formatFileSize } from "@/lib/utils"
import Link from "next/link"
import { motion } from "framer-motion"

export default function ImageCompressPage() {
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [originalUrl, setOriginalUrl] = useState("")
  const [compressedUrl, setCompressedUrl] = useState("")
  const [originalSize, setOriginalSize] = useState(0)
  const [compressedSize, setCompressedSize] = useState(0)
  const [quality, setQuality] = useState(0.8)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setOriginalFile(file)
    setOriginalSize(file.size)
    setCompressedUrl("")
    
    const reader = new FileReader()
    reader.onload = (e) => {
      setOriginalUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    multiple: false
  })

  const compressImage = () => {
    if (!originalUrl || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      
      const compressed = canvas.toDataURL('image/jpeg', quality)
      setCompressedUrl(compressed)
      
      // Calculate compressed size (base64 to bytes)
      const base64Length = compressed.length - (compressed.indexOf(',') + 1)
      const padding = compressed.endsWith('==') ? 2 : compressed.endsWith('=') ? 1 : 0
      const bytes = (base64Length * 3) / 4 - padding
      setCompressedSize(bytes)
    }
    img.src = originalUrl
  }

  const downloadImage = () => {
    if (!compressedUrl) return

    const link = document.createElement('a')
    link.download = `compressed-${originalFile?.name || 'image.jpg'}`
    link.href = compressedUrl
    link.click()
  }

  const savingsPercent = originalSize > 0 
    ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
    : 0

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="container mx-auto max-w-5xl">
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--cyan-500)] to-[var(--cyan-600)] flex items-center justify-center shadow-lg shadow-[var(--cyan-500)]/20">
              <Minimize2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
                บีบอัดรูปภาพ
              </h1>
              <p className="text-[var(--text-secondary)] mt-1">
                ลดขนาดรูปภาพโดยยังคงคุณภาพ
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload & Settings */}
          <div className="space-y-6">
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
                  <CardDescription>รองรับ PNG, JPG, JPEG, WebP</CardDescription>
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
                          หรือคลิกเพื่อเลือกไฟล์
                        </p>
                        <Button variant="secondary" size="sm">
                          เลือกรูปภาพ
                        </Button>
                      </div>
                    )}
                  </div>

                  {originalFile && (
                    <motion.div 
                      className="mt-4 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)]"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <p className="font-semibold text-[var(--text-primary)] mb-1">
                        📁 {originalFile.name}
                      </p>
                      <p className="text-sm text-[var(--text-muted)]">
                        ขนาด: {formatFileSize(originalSize)}
                      </p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Quality Settings */}
            {originalFile && !compressedUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle>ตั้งค่าคุณภาพ</CardTitle>
                    <CardDescription>ยิ่งคุณภาพต่ำ ไฟล์ยิ่งเล็ก</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-[var(--text-primary)] mb-3">
                        คุณภาพ: <span className="text-[var(--primary-500)]">{Math.round(quality * 100)}%</span>
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={quality}
                        onChange={(e) => setQuality(Number(e.target.value))}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, var(--primary-500) 0%, var(--primary-500) ${quality * 100}%, var(--bg-elevated) ${quality * 100}%, var(--bg-elevated) 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs text-[var(--text-muted)] mt-2">
                        <span>ต่ำสุด (10%)</span>
                        <span>สูงสุด (100%)</span>
                      </div>
                    </div>

                    <Button
                      onClick={compressImage}
                      className="w-full h-12"
                    >
                      <Minimize2 className="w-5 h-5" />
                      บีบอัดรูปภาพ
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Result */}
          <div>
            <canvas ref={canvasRef} className="hidden" />
            
            {compressedUrl ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingDown className="w-5 h-5 text-emerald-500" />
                      บีบอัดเสร็จแล้ว!
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Preview */}
                    <div className="rounded-xl overflow-hidden border border-[var(--border-default)] bg-white p-4">
                      <img
                        src={compressedUrl}
                        alt="Compressed"
                        className="max-w-full h-auto mx-auto"
                        style={{ maxHeight: '300px' }}
                      />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 rounded-xl bg-[var(--bg-surface)]">
                        <p className="text-xs text-[var(--text-muted)] mb-1">เดิม</p>
                        <p className="font-bold text-sm text-[var(--text-primary)]">
                          {formatFileSize(originalSize)}
                        </p>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-emerald-500/10">
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">ลด</p>
                        <p className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                          {savingsPercent}%
                        </p>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-[var(--bg-surface)]">
                        <p className="text-xs text-[var(--text-muted)] mb-1">ใหม่</p>
                        <p className="font-bold text-sm text-[var(--text-primary)]">
                          {formatFileSize(compressedSize)}
                        </p>
                      </div>
                    </div>

                    {/* Success */}
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                        ✓ ประหยัด {formatFileSize(originalSize - compressedSize)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3">
                      <Button onClick={downloadImage} className="w-full h-12">
                        <Download className="w-5 h-5" />
                        ดาวน์โหลด
                      </Button>
                      <Button
                        onClick={() => {
                          setOriginalFile(null)
                          setCompressedUrl("")
                        }}
                        variant="secondary"
                        className="w-full h-12"
                      >
                        บีบอัดใหม่
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card variant="glass" className="h-full">
                  <CardHeader>
                    <CardTitle>ผลลัพธ์</CardTitle>
                    <CardDescription>รูปภาพที่บีบอัดแล้วจะแสดงที่นี่</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-16">
                      <div className="w-24 h-24 rounded-3xl glass border border-[var(--glass-border)] flex items-center justify-center mx-auto mb-6">
                        <ImageIcon className="w-12 h-12 text-[var(--text-muted)]" />
                      </div>
                      <h3 className="font-bold text-xl text-[var(--text-primary)] mb-2">
                        ยังไม่มีผลลัพธ์
                      </h3>
                      <p className="text-[var(--text-secondary)]">
                        อัพโหลดรูปภาพและกดปุ่ม "บีบอัด"
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
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
            { icon: "📉", title: "ลดขนาดมาก", desc: "บีบอัดได้มากกว่า 70%" },
            { icon: "🖼️", title: "คงคุณภาพ", desc: "ปรับระดับคุณภาพได้ตามต้องการ" },
            { icon: "⚡", title: "รวดเร็ว", desc: "ประมวลผลทันที" },
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



