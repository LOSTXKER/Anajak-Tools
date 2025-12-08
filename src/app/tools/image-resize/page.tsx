"use client"

import { useState, useRef } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Image as ImageIcon, Download, Upload, Maximize2 } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { formatFileSize } from "@/lib/utils"

export default function ImageResizePage() {
  const [originalImage, setOriginalImage] = useState<File | null>(null)
  const [originalUrl, setOriginalUrl] = useState("")
  const [resizedUrl, setResizedUrl] = useState("")
  const [width, setWidth] = useState(800)
  const [height, setHeight] = useState(600)
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true)
  const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 })
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setOriginalImage(file)
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        setOriginalUrl(e.target?.result as string)
        setOriginalSize({ width: img.width, height: img.height })
        setWidth(img.width)
        setHeight(img.height)
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif']
    },
    multiple: false
  })

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth)
    if (maintainAspectRatio && originalSize.width > 0) {
      const ratio = originalSize.height / originalSize.width
      setHeight(Math.round(newWidth * ratio))
    }
  }

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight)
    if (maintainAspectRatio && originalSize.height > 0) {
      const ratio = originalSize.width / originalSize.height
      setWidth(Math.round(newHeight * ratio))
    }
  }

  const resizeImage = () => {
    if (!originalUrl || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = width
      canvas.height = height
      
      ctx.clearRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)
      
      setResizedUrl(canvas.toDataURL('image/png'))
    }
    img.src = originalUrl
  }

  const downloadImage = () => {
    if (!resizedUrl) return

    const link = document.createElement('a')
    link.download = `resized-${originalImage?.name || 'image.png'}`
    link.href = resizedUrl
    link.click()
  }

  const setPresetSize = (w: number, h: number) => {
    setWidth(w)
    setHeight(h)
  }

  return (
    <div className="container mx-auto py-20 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--cyan-500)] to-[var(--cyan-600)] flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="heading-2 text-3xl">ปรับขนาดรูปภาพ</h1>
            <p className="caption">ปรับขนาดรูปภาพให้เหมาะสมกับการใช้งาน</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload & Settings */}
        <div className="space-y-6">
          {/* Upload Area */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle>อัพโหลดรูปภาพ</CardTitle>
              <CardDescription>รองรับ PNG, JPG, WEBP, GIF</CardDescription>
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
                  <p className="text-[var(--primary-500)] font-medium">วางรูปภาพที่นี่...</p>
                ) : (
                  <div>
                    <p className="font-medium text-[var(--text-primary)] mb-2">
                      ลากรูปภาพมาวางที่นี่
                    </p>
                    <p className="text-sm text-[var(--text-muted)]">
                      หรือคลิกเพื่อเลือกไฟล์
                    </p>
                  </div>
                )}
              </div>

              {originalImage && (
                <div className="mt-4 p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)]">
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    📁 {originalImage.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {originalSize.width} × {originalSize.height} px • {formatFileSize(originalImage.size)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resize Settings */}
          {originalImage && (
            <Card variant="glass">
              <CardHeader>
                <CardTitle>ตั้งค่าขนาด</CardTitle>
                <CardDescription>กำหนดขนาดที่ต้องการ</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Maintain Aspect Ratio */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={maintainAspectRatio}
                    onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                    className="w-4 h-4 rounded border-[var(--border-default)]"
                  />
                  <span className="text-sm text-[var(--text-primary)]">
                    รักษาสัดส่วนภาพ
                  </span>
                </label>

                {/* Width */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    ความกว้าง (px)
                  </label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => handleWidthChange(Number(e.target.value))}
                    min="1"
                    max="5000"
                    className="w-full px-4 py-2 rounded-lg glass border border-[var(--glass-border)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]"
                  />
                </div>

                {/* Height */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    ความสูง (px)
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => handleHeightChange(Number(e.target.value))}
                    min="1"
                    max="5000"
                    className="w-full px-4 py-2 rounded-lg glass border border-[var(--glass-border)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]"
                  />
                </div>

                {/* Preset Sizes */}
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)] mb-2">
                    ขนาดมาตรฐาน:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPresetSize(1920, 1080)}
                      className="px-3 py-2 text-sm rounded-lg glass border border-[var(--glass-border)] hover:border-[var(--primary-500)] transition-colors"
                    >
                      Full HD<br/><span className="text-xs text-[var(--text-muted)]">1920×1080</span>
                    </button>
                    <button
                      onClick={() => setPresetSize(1280, 720)}
                      className="px-3 py-2 text-sm rounded-lg glass border border-[var(--glass-border)] hover:border-[var(--primary-500)] transition-colors"
                    >
                      HD<br/><span className="text-xs text-[var(--text-muted)]">1280×720</span>
                    </button>
                    <button
                      onClick={() => setPresetSize(800, 600)}
                      className="px-3 py-2 text-sm rounded-lg glass border border-[var(--glass-border)] hover:border-[var(--primary-500)] transition-colors"
                    >
                      SVGA<br/><span className="text-xs text-[var(--text-muted)]">800×600</span>
                    </button>
                    <button
                      onClick={() => setPresetSize(640, 480)}
                      className="px-3 py-2 text-sm rounded-lg glass border border-[var(--glass-border)] hover:border-[var(--primary-500)] transition-colors"
                    >
                      VGA<br/><span className="text-xs text-[var(--text-muted)]">640×480</span>
                    </button>
                  </div>
                </div>

                {/* Resize Button */}
                <Button
                  onClick={resizeImage}
                  className="w-full"
                  size="lg"
                >
                  <Maximize2 className="w-5 h-5" />
                  ปรับขนาด
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Preview */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>ผลลัพธ์</CardTitle>
            <CardDescription>รูปภาพที่ปรับขนาดแล้ว</CardDescription>
          </CardHeader>
          <CardContent>
            <canvas ref={canvasRef} className="hidden" />
            
            {resizedUrl ? (
              <div className="space-y-4">
                {/* Image Preview */}
                <div className="rounded-lg overflow-hidden border border-[var(--border-default)] bg-white p-4">
                  <img
                    src={resizedUrl}
                    alt="Resized"
                    className="max-w-full h-auto mx-auto"
                    style={{ maxHeight: '400px' }}
                  />
                </div>

                {/* Info */}
                <div className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)]">
                  <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
                    ขนาดใหม่: {width} × {height} px
                  </p>
                </div>

                {/* Download Button */}
                <Button
                  onClick={downloadImage}
                  className="w-full"
                  size="lg"
                >
                  <Download className="w-5 h-5" />
                  ดาวน์โหลดรูปภาพ
                </Button>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-full glass border border-[var(--glass-border)] flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="w-10 h-10 text-[var(--text-muted)]" />
                </div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">
                  ยังไม่มีผลลัพธ์
                </h3>
                <p className="caption">
                  อัพโหลดรูปภาพและกดปุ่ม "ปรับขนาด"
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



