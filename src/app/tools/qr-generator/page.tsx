"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { QrCode, Download, Copy, Check, ArrowLeft, Sparkles } from "lucide-react"
import QRCodeLib from "qrcode"
import Link from "next/link"
import { motion } from "framer-motion"

export default function QRGeneratorPage() {
  const [text, setText] = useState("")
  const [qrDataUrl, setQrDataUrl] = useState("")
  const [size, setSize] = useState(300)
  const [copied, setCopied] = useState(false)

  const generateQR = async () => {
    if (!text.trim()) return

    try {
      const dataUrl = await QRCodeLib.toDataURL(text, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      setQrDataUrl(dataUrl)
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

  const downloadQR = () => {
    if (!qrDataUrl) return

    const link = document.createElement('a')
    link.download = 'qrcode.png'
    link.href = qrDataUrl
    link.click()
  }

  const copyToClipboard = async () => {
    if (!qrDataUrl) return

    try {
      const response = await fetch(qrDataUrl)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
    }
  }

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
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
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <QrCode className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
                สร้าง QR Code
              </h1>
              <p className="text-[var(--text-secondary)] mt-1">
                สร้าง QR Code จากข้อความ URL หรือข้อมูลใดก็ได้ ฟรี ไม่จำกัด
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card variant="glass" className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[var(--primary-500)]" />
                  ข้อมูลสำหรับสร้าง QR Code
                </CardTitle>
                <CardDescription>กรอกข้อความหรือ URL ที่ต้องการแปลงเป็น QR Code</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Text Input */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                    ข้อความหรือ URL
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="https://example.com หรือข้อความใดก็ได้"
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl glass border border-[var(--glass-border)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent resize-none transition-all"
                  />
                </div>

                {/* Size Selector */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-primary)] mb-3">
                    ขนาด: <span className="text-[var(--primary-500)]">{size}×{size} px</span>
                  </label>
                  <input
                    type="range"
                    min="200"
                    max="600"
                    step="50"
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, var(--primary-500) 0%, var(--primary-500) ${((size - 200) / 400) * 100}%, var(--bg-elevated) ${((size - 200) / 400) * 100}%, var(--bg-elevated) 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-[var(--text-muted)] mt-2">
                    <span>200px</span>
                    <span>400px</span>
                    <span>600px</span>
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={generateQR}
                  disabled={!text.trim()}
                  className="w-full h-12"
                  size="lg"
                >
                  <QrCode className="w-5 h-5" />
                  สร้าง QR Code
                </Button>

                {/* Quick Examples */}
                <div className="pt-6 border-t border-[var(--border-default)]">
                  <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">ตัวอย่างข้อมูล:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "🌐 Website", value: "https://anajak.tools" },
                      { label: "📧 Email", value: "mailto:hello@anajak.tools" },
                      { label: "📱 Phone", value: "tel:+66123456789" },
                      { label: "📶 WiFi", value: "WIFI:T:WPA;S:MyNetwork;P:password123;;" },
                    ].map((example, i) => (
                      <button
                        key={i}
                        onClick={() => setText(example.value)}
                        className="px-4 py-2.5 text-sm rounded-xl glass border border-[var(--glass-border)] hover:border-[var(--primary-500)] hover:bg-[var(--primary-500)]/5 transition-all text-left"
                      >
                        {example.label}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* QR Code Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card variant="glass" className="h-full">
              <CardHeader>
                <CardTitle>QR Code ของคุณ</CardTitle>
                <CardDescription>ดาวน์โหลดหรือคัดลอกไปใช้งานได้เลย</CardDescription>
              </CardHeader>
              <CardContent>
                {qrDataUrl ? (
                  <motion.div 
                    className="space-y-6"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* QR Code Image */}
                    <div className="flex justify-center p-8 bg-white rounded-2xl shadow-inner">
                      <img
                        src={qrDataUrl}
                        alt="Generated QR Code"
                        className="max-w-full h-auto"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={downloadQR}
                        variant="secondary"
                        className="w-full h-12"
                      >
                        <Download className="w-5 h-5" />
                        ดาวน์โหลด PNG
                      </Button>
                      <Button
                        onClick={copyToClipboard}
                        variant="secondary"
                        className="w-full h-12"
                      >
                        {copied ? (
                          <>
                            <Check className="w-5 h-5 text-emerald-500" />
                            คัดลอกแล้ว!
                          </>
                        ) : (
                          <>
                            <Copy className="w-5 h-5" />
                            คัดลอก
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Info */}
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">
                        ✓ QR Code สร้างเสร็จแล้ว! พร้อมใช้งาน
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 rounded-3xl glass border border-[var(--glass-border)] flex items-center justify-center mx-auto mb-6">
                      <QrCode className="w-12 h-12 text-[var(--text-muted)]" />
                    </div>
                    <h3 className="font-bold text-xl text-[var(--text-primary)] mb-2">
                      ยังไม่มี QR Code
                    </h3>
                    <p className="text-[var(--text-secondary)]">
                      กรอกข้อความและกด "สร้าง QR Code" เพื่อเริ่มต้น
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Features */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {[
            { icon: "⚡", title: "สร้างทันที", desc: "ไม่ต้องรอ สร้าง QR Code ได้ในพริบตา" },
            { icon: "🔒", title: "ปลอดภัย 100%", desc: "ประมวลผลบนเครื่องคุณ ไม่ส่งข้อมูลออกไป" },
            { icon: "📱", title: "สแกนได้ทุกที่", desc: "รองรับทุก QR Reader ทั้ง iOS และ Android" },
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
