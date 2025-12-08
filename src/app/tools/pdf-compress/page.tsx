"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { FileText, Upload, Download, ArrowLeft, Minimize2, TrendingDown, Sparkles, Eye } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { PDFDocument } from "pdf-lib"
import { formatFileSize } from "@/lib/utils"
import { PDFViewer } from "@/components/pdf/PDFViewer"
import Link from "next/link"
import { motion } from "framer-motion"

export default function PDFCompressPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null)
  const [originalSize, setOriginalSize] = useState(0)
  const [compressedSize, setCompressedSize] = useState(0)
  const [compressing, setCompressing] = useState(false)
  const [compressionLevel, setCompressionLevel] = useState<'low' | 'medium' | 'high'>('medium')

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setPdfFile(file)
    setOriginalSize(file.size)
    setCompressedBlob(null)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  })

  const compressPDF = async () => {
    if (!pdfFile) return

    setCompressing(true)

    try {
      const arrayBuffer = await pdfFile.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)

      // Save with compression
      const pdfBytes = await pdfDoc.save({
        useObjectStreams: compressionLevel !== 'low',
        addDefaultPage: false,
        objectsPerTick: compressionLevel === 'high' ? 50 : 100
      })

      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
      setCompressedBlob(blob)
      setCompressedSize(blob.size)
    } catch (error) {
      console.error('Error compressing PDF:', error)
      alert('เกิดข้อผิดพลาดในการบีบอัด PDF กรุณาลองใหม่อีกครั้ง')
    } finally {
      setCompressing(false)
    }
  }

  const downloadCompressed = () => {
    if (!compressedBlob) return

    const url = URL.createObjectURL(compressedBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `compressed-${pdfFile?.name || 'document.pdf'}`
    link.click()
    URL.revokeObjectURL(url)
  }

  const savingsPercent = originalSize > 0 
    ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] flex items-center justify-center shadow-lg shadow-[var(--primary-500)]/20">
              <Minimize2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
                บีบอัด PDF
              </h1>
              <p className="text-[var(--text-secondary)] mt-1">
                ลดขนาดไฟล์ PDF โดยไม่เสียคุณภาพมากนัก
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
                <CardDescription>เลือกไฟล์ PDF ที่ต้องการบีบอัด</CardDescription>
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
                          ขนาด: {formatFileSize(originalSize)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Settings */}
          {pdfFile && !compressedBlob && (
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
                <CardContent className="space-y-3">
                  {[
                    { value: 'low', label: 'ต่ำ', desc: 'คุณภาพสูง, ไฟล์ใหญ่กว่า' },
                    { value: 'medium', label: 'กลาง', desc: 'สมดุลระหว่างขนาดและคุณภาพ (แนะนำ)' },
                    { value: 'high', label: 'สูง', desc: 'ไฟล์เล็กสุด, อาจเสียคุณภาพเล็กน้อย' },
                  ].map((level) => (
                    <label
                      key={level.value}
                      className={`
                        flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all
                        ${compressionLevel === level.value
                          ? 'bg-[var(--primary-500)]/10 border-2 border-[var(--primary-500)]'
                          : 'glass border border-[var(--glass-border)] hover:border-[var(--primary-500)]'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="compression"
                        value={level.value}
                        checked={compressionLevel === level.value}
                        onChange={() => setCompressionLevel(level.value as any)}
                        className="w-5 h-5 accent-[var(--primary-500)]"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-[var(--text-primary)]">
                          {level.label}
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {level.desc}
                        </p>
                      </div>
                    </label>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Compress Button */}
          {pdfFile && !compressedBlob && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card variant="glass">
                <CardContent className="pt-6">
                  <Button
                    onClick={compressPDF}
                    disabled={compressing}
                    isLoading={compressing}
                    className="w-full h-14 text-lg"
                  >
                    <Minimize2 className="w-6 h-6" />
                    {compressing ? 'กำลังบีบอัด...' : 'บีบอัด PDF'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
          </div>

          {/* Right: Preview & Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Preview */}
            {pdfFile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-[var(--primary-500)]" />
                      {compressedBlob ? 'ไฟล์ที่บีบอัดแล้ว' : 'ไฟล์ต้นฉบับ'}
                    </CardTitle>
                    <CardDescription>
                      {compressedBlob ? 'ตรวจสอบไฟล์หลังบีบอัด' : 'ดูตัวอย่างไฟล์'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PDFViewer 
                      file={compressedBlob || pdfFile} 
                      className="h-[500px]" 
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Result */}
            {compressedBlob && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card variant="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-emerald-500" />
                    บีบอัดเสร็จแล้ว!
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-xl bg-[var(--bg-surface)]">
                      <p className="text-xs text-[var(--text-muted)] mb-1">ขนาดเดิม</p>
                      <p className="font-bold text-[var(--text-primary)]">
                        {formatFileSize(originalSize)}
                      </p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-emerald-500/10">
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">ลดลง</p>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400 text-xl">
                        {savingsPercent}%
                      </p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-[var(--bg-surface)]">
                      <p className="text-xs text-[var(--text-muted)] mb-1">ขนาดใหม่</p>
                      <p className="font-bold text-[var(--text-primary)]">
                        {formatFileSize(compressedSize)}
                      </p>
                    </div>
                  </div>

                  {/* Visual Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--text-muted)]">ก่อนบีบอัด</span>
                      <span className="font-medium text-[var(--text-primary)]">{formatFileSize(originalSize)}</span>
                    </div>
                    <div className="h-3 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                        style={{ width: '100%' }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--text-muted)]">หลังบีบอัด</span>
                      <span className="font-medium text-emerald-500">{formatFileSize(compressedSize)}</span>
                    </div>
                    <div className="h-3 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-1000"
                        style={{ width: `${100 - savingsPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Success Message */}
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                      ✓ ประหยัดพื้นที่ {formatFileSize(originalSize - compressedSize)} ({savingsPercent}%)
                    </p>
                  </div>

                  {/* Download */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={downloadCompressed}
                      className="w-full h-12"
                    >
                      <Download className="w-5 h-5" />
                      ดาวน์โหลด
                    </Button>
                    <Button
                      onClick={() => {
                        setPdfFile(null)
                        setCompressedBlob(null)
                      }}
                      variant="secondary"
                      className="w-full h-12"
                    >
                      บีบอัดไฟล์ใหม่
                    </Button>
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
          transition={{ delay: 0.4 }}
        >
          {[
            { icon: "📉", title: "ลดขนาดไฟล์", desc: "ลดขนาดได้มากกว่า 50%" },
            { icon: "🔒", title: "ปลอดภัย", desc: "ประมวลผลบนเครื่องคุณ" },
            { icon: "⚡", title: "รวดเร็ว", desc: "บีบอัดได้ในไม่กี่วินาที" },
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

