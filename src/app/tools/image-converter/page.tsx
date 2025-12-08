"use client"

import { useState, useRef } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Image as ImageIcon, Upload, Download, ArrowLeft, RefreshCw, Sparkles } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { formatFileSize } from "@/lib/utils"
import Link from "next/link"
import { motion } from "framer-motion"

type ImageFormat = 'png' | 'jpeg' | 'webp'

export default function ImageConverterPage() {
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [originalUrl, setOriginalUrl] = useState("")
  const [convertedUrl, setConvertedUrl] = useState("")
  const [outputFormat, setOutputFormat] = useState<ImageFormat>('png')
  const [quality, setQuality] = useState(0.9)
  const [originalSize, setOriginalSize] = useState(0)
  const [convertedSize, setConvertedSize] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setOriginalFile(file)
    setOriginalSize(file.size)
    setConvertedUrl("")
    
    const reader = new FileReader()
    reader.onload = (e) => {
      setOriginalUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp']
    },
    multiple: false
  })

  const convertImage = () => {
    if (!originalUrl || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      
      const mimeType = outputFormat === 'jpeg' ? 'image/jpeg' : `image/${outputFormat}`
      const converted = canvas.toDataURL(mimeType, quality)
      setConvertedUrl(converted)
      
      // Calculate converted size
      const base64Length = converted.length - (converted.indexOf(',') + 1)
      const padding = converted.endsWith('==') ? 2 : converted.endsWith('=') ? 1 : 0
      const bytes = (base64Length * 3) / 4 - padding
      setConvertedSize(bytes)
    }
    img.src = originalUrl
  }

  const downloadImage = () => {
    if (!convertedUrl) return

    const link = document.createElement('a')
    const fileName = originalFile?.name.replace(/\.[^/.]+$/, "") || 'image'
    link.download = `${fileName}.${outputFormat}`
    link.href = convertedUrl
    link.click()
  }

  const formats: { value: ImageFormat; label: string; desc: string; icon: string }[] = [
    { value: 'png', label: 'PNG', desc: 'คุณภาพสูง, รองรับพื้นหลังโปร่งใส', icon: '🖼️' },
    { value: 'jpeg', label: 'JPEG', desc: 'ขนาดไฟล์เล็ก, เหมาะกับรูปภาพ', icon: '📷' },
    { value: 'webp', label: 'WebP', desc: 'รูปแบบใหม่, ขนาดเล็ก คุณภาพดี', icon: '🌐' },
  ]

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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <RefreshCw className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
                แปลงรูปแบบรูปภาพ
              </h1>
              <p className="text-[var(--text-secondary)] mt-1">
                แปลงรูปภาพระหว่าง PNG, JPEG, WebP
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload & Settings */}
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
                  <CardDescription>รองรับ PNG, JPG, WebP, GIF, BMP</CardDescription>
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
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-[var(--border-default)]">
                          <img src={originalUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-[var(--text-primary)] text-sm">
                            {originalFile.name}
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">
                            ขนาด: {formatFileSize(originalSize)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Format Selection */}
            {originalFile && !convertedUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle>เลือกรูปแบบ Output</CardTitle>
                    <CardDescription>รูปแบบที่ต้องการแปลง</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {formats.map((format) => (
                        <label
                          key={format.value}
                          className={`
                            flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all
                            ${outputFormat === format.value
                              ? 'bg-[var(--primary-500)]/10 border-2 border-[var(--primary-500)]'
                              : 'glass border border-[var(--glass-border)] hover:border-[var(--primary-500)]'
                            }
                          `}
                        >
                          <input
                            type="radio"
                            name="format"
                            value={format.value}
                            checked={outputFormat === format.value}
                            onChange={() => setOutputFormat(format.value)}
                            className="w-5 h-5 accent-[var(--primary-500)]"
                          />
                          <div className="text-2xl">{format.icon}</div>
                          <div className="flex-1">
                            <p className="font-bold text-[var(--text-primary)]">
                              {format.label}
                            </p>
                            <p className="text-xs text-[var(--text-secondary)]">
                              {format.desc}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>

                    {/* Quality Slider (only for JPEG and WebP) */}
                    {(outputFormat === 'jpeg' || outputFormat === 'webp') && (
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
                          <span>ต่ำสุด</span>
                          <span>สูงสุด</span>
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={convertImage}
                      className="w-full h-12"
                    >
                      <RefreshCw className="w-5 h-5" />
                      แปลงรูปแบบ
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Result */}
          <div>
            <canvas ref={canvasRef} className="hidden" />
            
            {convertedUrl ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle>✓ แปลงเสร็จแล้ว!</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Preview */}
                    <div className="rounded-xl overflow-hidden border border-[var(--border-default)] bg-white p-4">
                      <img
                        src={convertedUrl}
                        alt="Converted"
                        className="max-w-full h-auto mx-auto"
                        style={{ maxHeight: '300px' }}
                      />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 rounded-xl bg-[var(--bg-surface)]">
                        <p className="text-xs text-[var(--text-muted)] mb-1">รูปแบบเดิม</p>
                        <p className="font-bold text-sm text-[var(--text-primary)] uppercase">
                          {originalFile?.type.split('/')[1]}
                        </p>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-emerald-500/10">
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">รูปแบบใหม่</p>
                        <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400 uppercase">
                          {outputFormat}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 rounded-xl bg-[var(--bg-surface)]">
                        <p className="text-xs text-[var(--text-muted)] mb-1">ขนาดเดิม</p>
                        <p className="font-bold text-sm text-[var(--text-primary)]">
                          {formatFileSize(originalSize)}
                        </p>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-[var(--bg-surface)]">
                        <p className="text-xs text-[var(--text-muted)] mb-1">ขนาดใหม่</p>
                        <p className="font-bold text-sm text-[var(--text-primary)]">
                          {formatFileSize(convertedSize)}
                        </p>
                      </div>
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
                          setConvertedUrl("")
                        }}
                        variant="secondary"
                        className="w-full h-12"
                      >
                        แปลงใหม่
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
                    <CardDescription>รูปภาพที่แปลงแล้วจะแสดงที่นี่</CardDescription>
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
                        อัพโหลดรูปภาพและเลือกรูปแบบ
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
            { icon: "🔄", title: "แปลงง่าย", desc: "รองรับหลายรูปแบบ" },
            { icon: "⚡", title: "รวดเร็ว", desc: "ประมวลผลทันที" },
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



