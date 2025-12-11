"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { FileText, Upload, Download, ArrowLeft, Unlock, Sparkles, Trash2, Lock, Eye, Key, Folder } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { PDFDocument } from "pdf-lib"
import { PDFViewer } from "@/components/pdf/PDFViewer"
import Link from "next/link"
import { motion } from "framer-motion"
import { formatFileSize } from "@/lib/utils"

interface PDFFile {
  file: File
  unlocked: boolean
  unlockedBlob?: Blob
  error?: string
}

export default function PDFUnlockPage() {
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([])
  const [globalPassword, setGlobalPassword] = useState('')
  const [unlocking, setUnlocking] = useState(false)
  const [previewFile, setPreviewFile] = useState<File | Blob | null>(null)
  const [useGlobalPassword, setUseGlobalPassword] = useState(true)
  const [folderCount, setFolderCount] = useState(0)
  const [pdfjsLib, setPdfjsLib] = useState<any>(null)

  // Load PDF.js dynamically on client side only
  useEffect(() => {
    import('pdfjs-dist').then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
      setPdfjsLib(pdfjs)
    })
  }, [])

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

    const newFiles: PDFFile[] = filesToProcess.map(file => ({
      file,
      unlocked: false
    }))
    setPdfFiles([...pdfFiles, ...newFiles])
    
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

  const removeFile = (index: number) => {
    setPdfFiles(pdfFiles.filter((_, i) => i !== index))
  }

  const unlockPDF = async (file: File, password: string): Promise<Blob> => {
    if (!pdfjsLib) {
      throw new Error('PDF.js is not loaded yet')
    }

    const arrayBuffer = await file.arrayBuffer()
    
    // Try to load with PDF.js first to handle password
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      password: password
    })

    // Add timeout for loading
    const pdfDoc = await Promise.race([
      loadingTask.promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: การโหลด PDF ใช้เวลานานเกินไป')), 30000)
      )
    ]) as any

    const numPages = pdfDoc.numPages

    // Create a new PDF document without password using pdf-lib
    const newPdfDoc = await PDFDocument.create()

    // Extract each page and add to new document
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum)
      // Use scale 1.5 for balance between quality and speed
      const viewport = page.getViewport({ scale: 1.5 })

      // Create canvas to render page
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      if (!context) {
        throw new Error('ไม่สามารถสร้าง canvas context ได้')
      }
      
      canvas.width = viewport.width
      canvas.height = viewport.height

      // Render page to canvas with timeout
      await Promise.race([
        page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        } as any).promise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`Timeout: หน้า ${pageNum} ใช้เวลานานเกินไป`)), 30000)
        )
      ])

      // Convert canvas to image and add to new PDF (use JPEG for faster processing)
      const imgData = canvas.toDataURL('image/jpeg', 0.92)
      const imgBytes = await fetch(imgData).then(res => res.arrayBuffer())
      const image = await newPdfDoc.embedJpg(imgBytes)
      
      const newPage = newPdfDoc.addPage([viewport.width, viewport.height])
      newPage.drawImage(image, {
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height
      })
    }

    // Save the new PDF without password
    const pdfBytes = await newPdfDoc.save()
    return new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
  }

  const unlockAllWithGlobalPassword = async () => {
    if (!pdfjsLib) {
      alert('กรุณารอสักครู่ ระบบกำลังโหลด...')
      return
    }

    if (!globalPassword.trim()) {
      alert('กรุณากรอกรหัสผ่าน')
      return
    }

    setUnlocking(true)
    const updated = [...pdfFiles]
    
    for (let i = 0; i < updated.length; i++) {
      if (updated[i].unlocked) continue

      try {
        const unlockedBlob = await unlockPDF(updated[i].file, globalPassword)
        
        updated[i].unlocked = true
        updated[i].unlockedBlob = unlockedBlob
        updated[i].error = undefined
      } catch (error: any) {
        updated[i].unlocked = false
        
        const errorMsg = error.message || ''
        const errorName = error.name || ''
        
        // Check for specific error types
        if (errorName === 'PasswordException' || errorMsg.includes('password') || errorMsg.includes('Incorrect Password')) {
          updated[i].error = 'รหัสผ่านไม่ถูกต้อง'
        } else if (errorMsg.includes('No password given') || errorMsg.includes('need a password')) {
          updated[i].error = 'ไฟล์นี้ต้องการรหัสผ่าน'
        } else if (errorMsg.includes('Invalid PDF') || errorMsg.includes('Invalid XRef')) {
          updated[i].error = 'ไฟล์ PDF ไม่ถูกต้องหรือเสียหาย'
        } else if (errorMsg.includes('Timeout')) {
          updated[i].error = 'ใช้เวลานานเกินไป ลองใหม่อีกครั้ง'
        } else if (errorMsg.includes('not encrypted')) {
          // PDF is not encrypted, just copy it
          updated[i].unlocked = true
          updated[i].unlockedBlob = updated[i].file
          updated[i].error = undefined
        } else {
          updated[i].error = `เกิดข้อผิดพลาด: ${errorMsg || 'ไม่ทราบสาเหตุ'}`
        }
        
        console.error(`Error unlocking ${updated[i].file.name}:`, error)
      }
      
      // Update UI after each file
      setPdfFiles([...updated])
    }

    setUnlocking(false)
  }

  const downloadSingle = (pdfFile: PDFFile) => {
    if (!pdfFile.unlockedBlob) return

    const url = URL.createObjectURL(pdfFile.unlockedBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `unlocked-${pdfFile.file.name}`
    link.click()
    URL.revokeObjectURL(url)
  }

  const downloadAll = () => {
    pdfFiles.forEach(pdfFile => {
      if (pdfFile.unlocked && pdfFile.unlockedBlob) {
        downloadSingle(pdfFile)
      }
    })
  }

  const unlockedCount = pdfFiles.filter(f => f.unlocked).length
  const failedCount = pdfFiles.filter(f => f.error).length

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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Unlock className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
                ปลดล็อค PDF
              </h1>
              <p className="text-[var(--text-secondary)] mt-1">
                ถอดรหัสผ่าน PDF ทุกไฟล์ด้วยรหัสเดียว • รองรับโฟลเดอร์ 📁
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Upload & Password */}
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
                  <CardDescription>ลากไฟล์ หรือ โฟลเดอร์ มาวางที่นี่</CardDescription>
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
                        <Button variant="secondary" size="sm">
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

            {/* Password Input */}
            {pdfFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="w-5 h-5 text-[var(--primary-500)]" />
                      รหัสผ่าน
                    </CardTitle>
                    <CardDescription>กรอกรหัสผ่านสำหรับทุกไฟล์</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                        รหัสผ่าน PDF
                      </label>
                      <input
                        type="password"
                        value={globalPassword}
                        onChange={(e) => setGlobalPassword(e.target.value)}
                        placeholder="กรอกรหัสผ่าน..."
                        className="w-full px-4 py-3 rounded-xl glass border border-[var(--glass-border)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] text-lg"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && globalPassword) {
                            unlockAllWithGlobalPassword()
                          }
                        }}
                      />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[var(--bg-surface)]">
                      <div className="text-center">
                        <p className="text-xs text-[var(--text-muted)] mb-1">ทั้งหมด</p>
                        <p className="font-bold text-[var(--text-primary)]">{pdfFiles.length}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">สำเร็จ</p>
                        <p className="font-bold text-emerald-600 dark:text-emerald-400">{unlockedCount}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-red-500 mb-1">ล้มเหลว</p>
                        <p className="font-bold text-red-500">{failedCount}</p>
                      </div>
                    </div>

                    {/* Unlock Button */}
                    <Button
                      onClick={unlockAllWithGlobalPassword}
                      disabled={unlocking || !globalPassword || !pdfjsLib}
                      isLoading={unlocking}
                      className="w-full h-14 text-lg"
                    >
                      <Unlock className="w-6 h-6" />
                      {!pdfjsLib ? 'กำลังโหลด...' : unlocking ? 'กำลังปลดล็อค...' : 'ปลดล็อคทั้งหมด'}
                    </Button>

                    {/* Download All */}
                    {unlockedCount > 0 && (
                      <Button
                        onClick={downloadAll}
                        variant="secondary"
                        className="w-full h-12"
                      >
                        <Download className="w-5 h-5" />
                        ดาวน์โหลดทั้งหมด ({unlockedCount})
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Middle: File List */}
          <div className="lg:col-span-1">
            {pdfFiles.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card variant="glass">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>ไฟล์ PDF ({pdfFiles.length})</CardTitle>
                        <CardDescription>
                          ปลดล็อคแล้ว: {unlockedCount}/{pdfFiles.length}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {pdfFiles.map((pdfFile, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`
                          p-3 rounded-xl border-2 transition-all
                          ${pdfFile.unlocked 
                            ? 'bg-emerald-500/10 border-emerald-500' 
                            : pdfFile.error
                            ? 'bg-red-500/10 border-red-500'
                            : 'glass border-[var(--glass-border)]'
                          }
                        `}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className={`
                            w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                            ${pdfFile.unlocked 
                              ? 'bg-emerald-500/20' 
                              : pdfFile.error
                              ? 'bg-red-500/20'
                              : 'bg-[var(--primary-500)]/10'
                            }
                          `}>
                            {pdfFile.unlocked ? (
                              <Unlock className="w-5 h-5 text-emerald-500" />
                            ) : pdfFile.error ? (
                              <Lock className="w-5 h-5 text-red-500" />
                            ) : (
                              <Lock className="w-5 h-5 text-[var(--primary-500)]" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-[var(--text-primary)] truncate">
                              {pdfFile.file.name}
                            </p>
                            <p className="text-xs text-[var(--text-muted)]">
                              {formatFileSize(pdfFile.file.size)}
                            </p>

                            {/* Error */}
                            {pdfFile.error && (
                              <div className="mt-2 p-2 rounded-lg bg-red-500/10">
                                <p className="text-xs text-red-500">
                                  ❌ {pdfFile.error}
                                </p>
                              </div>
                            )}

                            {/* Success */}
                            {pdfFile.unlocked && (
                              <div className="mt-2 flex items-center gap-2">
                                <div className="flex-1 p-2 rounded-lg bg-emerald-500/10">
                                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                    ✓ ปลดล็อคสำเร็จ
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-1">
                            {pdfFile.unlocked && (
                              <>
                                <button
                                  onClick={() => setPreviewFile(pdfFile.unlockedBlob || null)}
                                  className="p-2 hover:bg-[var(--primary-500)]/10 rounded-lg text-[var(--primary-500)] transition-colors"
                                  title="ดู Preview"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => downloadSingle(pdfFile)}
                                  className="p-2 hover:bg-emerald-500/10 rounded-lg text-emerald-500 transition-colors"
                                  title="ดาวน์โหลด"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => removeFile(index)}
                              className="p-2 hover:bg-[var(--error)]/10 rounded-lg text-[var(--error)] transition-colors"
                              title="ลบ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card variant="glass" className="h-full">
                  <CardContent className="py-24 text-center">
                    <div className="w-24 h-24 rounded-3xl glass border border-[var(--glass-border)] flex items-center justify-center mx-auto mb-6">
                      <Lock className="w-12 h-12 text-[var(--text-muted)]" />
                    </div>
                    <h3 className="font-bold text-xl text-[var(--text-primary)] mb-2">
                      ยังไม่มีไฟล์
                    </h3>
                    <p className="text-[var(--text-secondary)]">
                      อัพโหลด PDF ที่ต้องการปลดล็อค
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right: Preview */}
          <div className="lg:col-span-1">
            {previewFile ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-emerald-500" />
                      PDF ที่ปลดล็อคแล้ว
                    </CardTitle>
                    <CardDescription>ดูตัวอย่างไฟล์</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PDFViewer file={previewFile} className="h-[600px]" />
                  </CardContent>
                </Card>
              </motion.div>
            ) : pdfFiles.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card variant="glass" className="h-full">
                  <CardContent className="py-24 text-center">
                    <div className="w-24 h-24 rounded-3xl glass border border-[var(--glass-border)] flex items-center justify-center mx-auto mb-6">
                      <Eye className="w-12 h-12 text-[var(--text-muted)]" />
                    </div>
                    <h3 className="font-bold text-xl text-[var(--text-primary)] mb-2">
                      ไม่มี Preview
                    </h3>
                    <p className="text-[var(--text-secondary)]">
                      ปลดล็อคไฟล์แล้วคลิก 👁️ เพื่อดู
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : null}
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
            { icon: "🔑", title: "รหัสเดียว", desc: "กรอกรหัสครั้งเดียวปลดทุกไฟล์" },
            { icon: "🔒", title: "ปลอดภัย", desc: "ประมวลผลบนเครื่องคุณ" },
            { icon: "⚡", title: "รวดเร็ว", desc: "ปลดล็อคได้ทันที" },
          ].map((feature, i) => (
            <div key={i} className="p-5 rounded-2xl glass border border-[var(--glass-border)] hover:border-[var(--primary-500)]/30 transition-colors">
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h4 className="font-bold text-[var(--text-primary)] mb-1">{feature.title}</h4>
              <p className="text-sm text-[var(--text-secondary)]">{feature.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Note */}
        <motion.div 
          className="mt-10 p-6 rounded-2xl glass border border-[var(--glass-border)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--primary-500)]" />
            การใช้งาน
          </h3>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--primary-500)] font-bold">1.</span>
              <span>อัพโหลดไฟล์ PDF ที่ต้องการปลดล็อค (รองรับหลายไฟล์)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--primary-500)] font-bold">2.</span>
              <span>กรอกรหัสผ่านครั้งเดียว (ถ้าทุกไฟล์ใช้รหัสเดียวกัน)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--primary-500)] font-bold">3.</span>
              <span>กดปุ่ม "ปลดล็อคทั้งหมด" - ระบบจะปลดล็อคทุกไฟล์อัตโนมัติ</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--primary-500)] font-bold">4.</span>
              <span>ดาวน์โหลดไฟล์ที่ปลดล็อคแล้วทีละไฟล์หรือทั้งหมดพร้อมกัน</span>
            </li>
          </ul>
          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <p className="text-sm text-amber-600 dark:text-amber-400">
              ⚠️ <strong>หมายเหตุ:</strong> เครื่องมือนี้ต้องการรหัสผ่านที่ถูกต้อง ไม่สามารถแคร็กรหัสผ่านได้
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
