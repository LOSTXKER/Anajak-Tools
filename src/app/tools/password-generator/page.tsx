"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Lock, Copy, Check, RefreshCw, ArrowLeft, Sparkles, Shield } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function PasswordGeneratorPage() {
  const [password, setPassword] = useState("")
  const [length, setLength] = useState(16)
  const [includeUppercase, setIncludeUppercase] = useState(true)
  const [includeLowercase, setIncludeLowercase] = useState(true)
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeSymbols, setIncludeSymbols] = useState(true)
  const [copied, setCopied] = useState(false)

  const generatePassword = () => {
    let charset = ''
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz'
    if (includeNumbers) charset += '0123456789'
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'

    if (!charset) {
      alert('กรุณาเลือกประเภทตัวอักษรอย่างน้อย 1 แบบ')
      return
    }

    let newPassword = ''
    for (let i = 0; i < length; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    
    setPassword(newPassword)
  }

  const copyToClipboard = async () => {
    if (!password) return
    
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying:', error)
    }
  }

  const getPasswordStrength = () => {
    if (!password) return { strength: 0, label: '', color: '' }
    
    let strength = 0
    if (password.length >= 12) strength++
    if (password.length >= 16) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++

    if (strength <= 2) return { strength: 33, label: 'อ่อน', color: 'from-red-500 to-red-600' }
    if (strength <= 4) return { strength: 66, label: 'ปานกลาง', color: 'from-orange-500 to-orange-600' }
    return { strength: 100, label: 'แข็งแรง', color: 'from-emerald-500 to-emerald-600' }
  }

  const strength = getPasswordStrength()

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="container mx-auto max-w-4xl">
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
              <Lock className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
                สร้างรหัสผ่าน
              </h1>
              <p className="text-[var(--text-secondary)] mt-1">
                สร้างรหัสผ่านที่ปลอดภัยและแข็งแรง
              </p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Password Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[var(--primary-500)]" />
                  รหัสผ่านของคุณ
                </CardTitle>
                <CardDescription>คัดลอกไปใช้งานได้เลย</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Password Field */}
                <div className="relative">
                  <input
                    type="text"
                    value={password}
                    readOnly
                    placeholder="กดปุ่ม 'สร้างรหัสผ่าน' เพื่อเริ่มต้น"
                    className="w-full px-6 py-4 rounded-xl glass border border-[var(--glass-border)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-mono text-lg text-center focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]"
                  />
                  {password && (
                    <button
                      onClick={copyToClipboard}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-[var(--bg-surface)] transition-colors"
                    >
                      {copied ? (
                        <Check className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Copy className="w-5 h-5 text-[var(--text-muted)]" />
                      )}
                    </button>
                  )}
                </div>

                {/* Strength Meter */}
                {password && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--text-muted)]">ความแข็งแรง</span>
                      <span className={`font-semibold bg-gradient-to-r ${strength.color} bg-clip-text text-transparent`}>
                        {strength.label}
                      </span>
                    </div>
                    <div className="h-2 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${strength.color} transition-all duration-500`}
                        style={{ width: `${strength.strength}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={generatePassword}
                    className="w-full h-12"
                  >
                    <RefreshCw className="w-5 h-5" />
                    สร้างรหัสผ่าน
                  </Button>
                  <Button
                    onClick={copyToClipboard}
                    disabled={!password}
                    variant="secondary"
                    className="w-full h-12"
                  >
                    {copied ? (
                      <>
                        <Check className="w-5 h-5" />
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
              </CardContent>
            </Card>
          </motion.div>

          {/* Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="glass">
              <CardHeader>
                <CardTitle>ตั้งค่ารหัสผ่าน</CardTitle>
                <CardDescription>กำหนดความยาวและประเภทตัวอักษร</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Length */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-primary)] mb-3">
                    ความยาว: <span className="text-[var(--primary-500)]">{length} ตัวอักษร</span>
                  </label>
                  <input
                    type="range"
                    min="8"
                    max="64"
                    value={length}
                    onChange={(e) => setLength(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, var(--primary-500) 0%, var(--primary-500) ${((length - 8) / 56) * 100}%, var(--bg-elevated) ${((length - 8) / 56) * 100}%, var(--bg-elevated) 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-[var(--text-muted)] mt-2">
                    <span>8</span>
                    <span>32</span>
                    <span>64</span>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    ประเภทตัวอักษร:
                  </p>
                  
                  {[
                    { label: 'ตัวพิมพ์ใหญ่ (A-Z)', checked: includeUppercase, setter: setIncludeUppercase, example: 'ABCDEFGH' },
                    { label: 'ตัวพิมพ์เล็ก (a-z)', checked: includeLowercase, setter: setIncludeLowercase, example: 'abcdefgh' },
                    { label: 'ตัวเลข (0-9)', checked: includeNumbers, setter: setIncludeNumbers, example: '01234567' },
                    { label: 'สัญลักษณ์ (!@#$)', checked: includeSymbols, setter: setIncludeSymbols, example: '!@#$%^&*' },
                  ].map((option, i) => (
                    <label
                      key={i}
                      className="flex items-center justify-between p-4 rounded-xl glass border border-[var(--glass-border)] hover:border-[var(--primary-500)]/30 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={option.checked}
                          onChange={(e) => option.setter(e.target.checked)}
                          className="w-5 h-5 accent-[var(--primary-500)] rounded"
                        />
                        <div>
                          <p className="font-medium text-sm text-[var(--text-primary)]">
                            {option.label}
                          </p>
                          <p className="text-xs text-[var(--text-muted)] font-mono">
                            {option.example}
                          </p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tips */}
        <motion.div 
          className="mt-10 p-6 rounded-2xl glass border border-[var(--glass-border)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--info)]/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-[var(--info)]" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--text-primary)] mb-2">
                💡 เคล็ดลับความปลอดภัย
              </h3>
              <ul className="space-y-1 text-sm text-[var(--text-secondary)]">
                <li>✓ ใช้รหัสผ่านที่แตกต่างกันสำหรับแต่ละบัญชี</li>
                <li>✓ ความยาวอย่างน้อย 12-16 ตัวอักษร</li>
                <li>✓ ผสมตัวพิมพ์ใหญ่-เล็ก ตัวเลข และสัญลักษณ์</li>
                <li>✓ เปลี่ยนรหัสผ่านเป็นประจำทุก 3-6 เดือน</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}



