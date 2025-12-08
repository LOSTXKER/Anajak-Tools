"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Palette, Copy, Check, ArrowLeft, Sparkles, RefreshCw } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function ColorPickerPage() {
  const [color, setColor] = useState("#3B82F6")
  const [copied, setCopied] = useState<string | null>(null)

  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 }
  }

  // Convert RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0,
      s = 0,
      l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6
          break
        case g:
          h = ((b - r) / d + 2) / 6
          break
        case b:
          h = ((r - g) / d + 4) / 6
          break
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    }
  }

  const rgb = hexToRgb(color)
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)

  const formats = [
    { label: "HEX", value: color.toUpperCase() },
    { label: "RGB", value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { label: "HSL", value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { label: "CSS Variable", value: `--color: ${color};` },
  ]

  const copyToClipboard = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(label)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error('Error copying:', error)
    }
  }

  const randomColor = () => {
    const randomHex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
    setColor(randomHex)
  }

  // Predefined color palette
  const colorPalette = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
    '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
    '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
    '#EC4899', '#F43F5E', '#64748B', '#475569', '#1E293B',
  ]

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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Palette className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
                เลือกสี
              </h1>
              <p className="text-[var(--text-secondary)] mt-1">
                เลือกสีและแปลงรูปแบบต่างๆ
              </p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Color Picker */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[var(--primary-500)]" />
                  เลือกสี
                </CardTitle>
                <CardDescription>คลิกที่พาเลทหรือใช้ตัวเลือกสี</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Main Color Display */}
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div
                    className="w-full md:w-64 h-64 rounded-2xl shadow-2xl border-4 border-white/20 transition-all duration-300"
                    style={{
                      backgroundColor: color,
                      boxShadow: `0 20px 60px ${color}40, 0 0 40px ${color}30`
                    }}
                  />
                  
                  <div className="flex-1 w-full space-y-4">
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-20 h-20 rounded-xl cursor-pointer border-2 border-[var(--border-default)]"
                      />
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                          รหัสสี HEX
                        </label>
                        <input
                          type="text"
                          value={color}
                          onChange={(e) => {
                            const val = e.target.value
                            if (/^#[0-9A-F]{0,6}$/i.test(val)) {
                              setColor(val)
                            }
                          }}
                          className="w-full px-4 py-3 rounded-xl glass border border-[var(--glass-border)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-mono text-lg uppercase focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]"
                        />
                      </div>
                      <Button
                        onClick={randomColor}
                        variant="secondary"
                        className="h-auto px-4"
                      >
                        <RefreshCw className="w-5 h-5" />
                        สุ่ม
                      </Button>
                    </div>

                    {/* RGB Sliders */}
                    <div className="space-y-3">
                      {['r', 'g', 'b'].map((channel) => (
                        <div key={channel}>
                          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 uppercase">
                            {channel}: {rgb[channel as keyof typeof rgb]}
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="255"
                            value={rgb[channel as keyof typeof rgb]}
                            onChange={(e) => {
                              const val = parseInt(e.target.value)
                              const newRgb = { ...rgb, [channel]: val }
                              const hex = '#' + Object.values(newRgb)
                                .map(x => x.toString(16).padStart(2, '0'))
                                .join('')
                              setColor(hex)
                            }}
                            className="w-full h-2 rounded-full appearance-none cursor-pointer"
                            style={{
                              background: channel === 'r' 
                                ? 'linear-gradient(to right, #000, #f00)'
                                : channel === 'g'
                                ? 'linear-gradient(to right, #000, #0f0)'
                                : 'linear-gradient(to right, #000, #00f)'
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Color Formats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="glass">
              <CardHeader>
                <CardTitle>รูปแบบสี</CardTitle>
                <CardDescription>คัดลอกรูปแบบที่ต้องการ</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {formats.map((format) => (
                  <div
                    key={format.label}
                    className="flex items-center justify-between p-4 rounded-xl glass border border-[var(--glass-border)] hover:border-[var(--primary-500)]/30 transition-colors"
                  >
                    <div>
                      <p className="text-xs font-semibold text-[var(--text-muted)] mb-1">
                        {format.label}
                      </p>
                      <p className="font-mono text-sm text-[var(--text-primary)]">
                        {format.value}
                      </p>
                    </div>
                    <Button
                      onClick={() => copyToClipboard(format.value, format.label)}
                      variant="ghost"
                      size="sm"
                    >
                      {copied === format.label ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Color Palette */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card variant="glass">
              <CardHeader>
                <CardTitle>พาเลทสี</CardTitle>
                <CardDescription>เลือกจากสีที่กำหนดไว้</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                  {colorPalette.map((paletteColor) => (
                    <button
                      key={paletteColor}
                      onClick={() => setColor(paletteColor)}
                      className={`aspect-square rounded-xl transition-all hover:scale-110 ${
                        color.toUpperCase() === paletteColor.toUpperCase()
                          ? 'ring-4 ring-[var(--primary-500)] ring-offset-2 ring-offset-[var(--bg-primary)] scale-110'
                          : 'hover:ring-2 hover:ring-white/50'
                      }`}
                      style={{ backgroundColor: paletteColor }}
                      title={paletteColor}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Color Shades */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card variant="glass">
              <CardHeader>
                <CardTitle>โทนสี</CardTitle>
                <CardDescription>เฉดสีจากอ่อนไปเข้ม</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                  {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90].map((shade) => {
                    const factor = shade / 100
                    const shadedRgb = {
                      r: Math.round(rgb.r + (255 - rgb.r) * (1 - factor)),
                      g: Math.round(rgb.g + (255 - rgb.g) * (1 - factor)),
                      b: Math.round(rgb.b + (255 - rgb.b) * (1 - factor)),
                    }
                    const shadedHex = '#' + Object.values(shadedRgb)
                      .map(x => x.toString(16).padStart(2, '0'))
                      .join('')
                    
                    return (
                      <button
                        key={shade}
                        onClick={() => setColor(shadedHex)}
                        className="aspect-square rounded-xl transition-all hover:scale-110 hover:ring-2 hover:ring-white/50"
                        style={{ backgroundColor: shadedHex }}
                        title={`${100 - shade}% - ${shadedHex}`}
                      />
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}



