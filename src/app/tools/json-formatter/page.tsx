"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Code, Copy, Check, FileJson, Wand2, Minimize2 } from "lucide-react"

export default function JSONFormatterPage() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [indentSize, setIndentSize] = useState(2)

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(input)
      const formatted = JSON.stringify(parsed, null, indentSize)
      setOutput(formatted)
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON")
      setOutput("")
    }
  }

  const minifyJSON = () => {
    try {
      const parsed = JSON.parse(input)
      const minified = JSON.stringify(parsed)
      setOutput(minified)
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON")
      setOutput("")
    }
  }

  const copyToClipboard = async () => {
    if (!output) return
    
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
    }
  }

  const clearAll = () => {
    setInput("")
    setOutput("")
    setError("")
  }

  const loadExample = () => {
    const example = {
      name: "Anajak Tools",
      description: "เครื่องมือครบ จบในที่เดียว",
      features: ["PDF Tools", "Image Tools", "AI Assistant"],
      stats: {
        tools: 80,
        users: 10000,
        free: true
      }
    }
    setInput(JSON.stringify(example))
  }

  return (
    <div className="container mx-auto py-20 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
            <Code className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="heading-2 text-3xl">JSON Formatter</h1>
            <p className="caption">จัดรูปแบบและตรวจสอบความถูกต้องของ JSON</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>JSON Input</span>
              <div className="flex gap-2">
                <button
                  onClick={loadExample}
                  className="text-xs px-3 py-1.5 rounded-lg glass border border-[var(--glass-border)] hover:border-[var(--primary-500)] transition-colors"
                >
                  ตัวอย่าง
                </button>
                <button
                  onClick={clearAll}
                  className="text-xs px-3 py-1.5 rounded-lg glass border border-[var(--glass-border)] hover:border-[var(--error)] transition-colors"
                >
                  ล้าง
                </button>
              </div>
            </CardTitle>
            <CardDescription>วาง JSON ของคุณที่นี่</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* JSON Input */}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='{"name": "value", "array": [1,2,3]}'
              rows={16}
              className="w-full px-4 py-3 rounded-lg glass border border-[var(--glass-border)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] resize-none font-mono text-sm"
            />

            {/* Controls */}
            <div className="space-y-3">
              {/* Indent Size */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  ขนาดการเว้นวรรค: {indentSize} spaces
                </label>
                <input
                  type="range"
                  min="2"
                  max="8"
                  step="2"
                  value={indentSize}
                  onChange={(e) => setIndentSize(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
                  <span>2</span>
                  <span>4</span>
                  <span>6</span>
                  <span>8</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={formatJSON}
                  disabled={!input.trim()}
                  className="w-full"
                >
                  <Wand2 className="w-4 h-4" />
                  Format
                </Button>
                <Button
                  onClick={minifyJSON}
                  disabled={!input.trim()}
                  variant="secondary"
                  className="w-full"
                >
                  <Minimize2 className="w-4 h-4" />
                  Minify
                </Button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-3 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20">
                <p className="text-sm text-[var(--error)] font-mono">
                  ❌ {error}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Output</span>
              {output && (
                <Button
                  onClick={copyToClipboard}
                  variant="ghost"
                  size="sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      คัดลอกแล้ว
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      คัดลอก
                    </>
                  )}
                </Button>
              )}
            </CardTitle>
            <CardDescription>JSON ที่จัดรูปแบบแล้ว</CardDescription>
          </CardHeader>
          <CardContent>
            {output ? (
              <div className="relative">
                <pre className="w-full px-4 py-3 rounded-lg glass border border-[var(--glass-border)] bg-[var(--bg-surface)] text-[var(--text-primary)] overflow-x-auto font-mono text-sm max-h-[500px] overflow-y-auto">
                  {output}
                </pre>
                
                {/* Stats */}
                <div className="mt-4 flex gap-4 text-xs text-[var(--text-muted)]">
                  <span>ขนาด: {new Blob([output]).size} bytes</span>
                  <span>บรรทัด: {output.split('\n').length}</span>
                  <span>อักขระ: {output.length}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-full glass border border-[var(--glass-border)] flex items-center justify-center mx-auto mb-4">
                  <FileJson className="w-10 h-10 text-[var(--text-muted)]" />
                </div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">
                  ยังไม่มีผลลัพธ์
                </h3>
                <p className="caption">
                  วาง JSON และกดปุ่ม Format หรือ Minify
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <div className="p-4 rounded-xl glass border border-[var(--glass-border)]">
          <div className="text-2xl mb-2">✨</div>
          <h4 className="font-semibold text-sm mb-1">จัดรูปแบบสวย</h4>
          <p className="text-xs text-[var(--text-muted)]">ทำให้ JSON อ่านง่ายขึ้น</p>
        </div>
        <div className="p-4 rounded-xl glass border border-[var(--glass-border)]">
          <div className="text-2xl mb-2">🔍</div>
          <h4 className="font-semibold text-sm mb-1">ตรวจสอบ Syntax</h4>
          <p className="text-xs text-[var(--text-muted)]">แจ้งเตือนเมื่อมีข้อผิดพลาด</p>
        </div>
        <div className="p-4 rounded-xl glass border border-[var(--glass-border)]">
          <div className="text-2xl mb-2">📦</div>
          <h4 className="font-semibold text-sm mb-1">Minify</h4>
          <p className="text-xs text-[var(--text-muted)]">ลดขนาดไฟล์ JSON</p>
        </div>
        <div className="p-4 rounded-xl glass border border-[var(--glass-border)]">
          <div className="text-2xl mb-2">⚡</div>
          <h4 className="font-semibold text-sm mb-1">ประมวลผลทันที</h4>
          <p className="text-xs text-[var(--text-muted)]">ทำงานบนเครื่องคุณ</p>
        </div>
      </div>
    </div>
  )
}



