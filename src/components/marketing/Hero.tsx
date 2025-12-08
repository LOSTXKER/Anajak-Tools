"use client"

import { Button } from "@/components/ui/Button"
import { Sparkles, Zap, Shield, ArrowRight, Star } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        {/* Gradient Orbs */}
        <motion.div 
          className="absolute top-20 left-[10%] w-96 h-96 bg-[var(--primary-500)] rounded-full mix-blend-multiply filter blur-[120px] opacity-30"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.2, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-40 right-[10%] w-96 h-96 bg-[var(--cyan-500)] rounded-full mix-blend-multiply filter blur-[120px] opacity-25"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.25, 0.15, 0.25],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-[var(--gold-500)] rounded-full mix-blend-multiply filter blur-[100px] opacity-20"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.1, 0.2],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(var(--text-primary) 1px, transparent 1px),
              linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-20 text-center relative">
        {/* Badge */}
        <motion.div 
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass border border-[var(--primary-500)]/30 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary-400)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--primary-500)]"></span>
          </span>
          <span className="text-sm font-medium bg-gradient-to-r from-[var(--primary-400)] to-[var(--cyan-400)] bg-clip-text text-transparent">
            เครื่องมือครบ จบในที่เดียว
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1 
          className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span className="bg-gradient-to-r from-[var(--primary-400)] via-[var(--primary-500)] to-[var(--cyan-500)] bg-clip-text text-transparent">
            อนาจักร ทูลส์
          </span>
          <br />
          <span className="text-[var(--text-primary)] text-4xl md:text-5xl lg:text-6xl">
            AI-Powered Productivity
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          แพลตฟอร์มเครื่องมือออนไลน์ที่ทรงพลัง พร้อม AI ช่วยเหลือ
          <br className="hidden sm:block" />
          สำหรับทุกคน ทุกธุรกิจ <span className="text-[var(--primary-500)] font-semibold">ฟรี ไม่จำกัด</span>
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link href="/tools">
            <Button size="lg" className="min-w-[220px] h-14 text-base group">
              <Zap className="w-5 h-5" />
              เริ่มใช้งานเลย
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/tools">
            <Button size="lg" variant="secondary" className="min-w-[220px] h-14 text-base">
              ดูเครื่องมือทั้งหมด
            </Button>
          </Link>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {[
            {
              icon: Sparkles,
              title: "AI ช่วยเหลือ",
              description: "ระบบ AI ตอบคำถามและช่วยทำงานอัตโนมัติ",
              gradient: "from-[var(--primary-500)] to-[var(--primary-600)]"
            },
            {
              icon: Zap,
              title: "80+ เครื่องมือ",
              description: "PDF, รูปภาพ, เอกสาร, การเงิน, และอื่นๆ",
              gradient: "from-[var(--cyan-500)] to-[var(--cyan-600)]"
            },
            {
              icon: Shield,
              title: "ปลอดภัย 100%",
              description: "ประมวลผลบนเครื่องคุณ ไม่เก็บข้อมูล",
              gradient: "from-[var(--gold-500)] to-[var(--gold-600)]"
            }
          ].map((feature, index) => (
            <motion.div 
              key={index}
              className="group relative glass rounded-2xl p-6 border border-[var(--glass-border)] hover:border-[var(--primary-500)]/50 transition-all duration-300"
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[var(--primary-500)]/0 to-[var(--cyan-500)]/0 group-hover:from-[var(--primary-500)]/5 group-hover:to-[var(--cyan-500)]/5 transition-all duration-300" />
              
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 mx-auto shadow-lg`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-[var(--text-primary)]">{feature.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div 
          className="flex flex-wrap justify-center gap-12 mt-16 pt-16 border-t border-[var(--border-default)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {[
            { value: "80+", label: "เครื่องมือ" },
            { value: "100%", label: "ฟรี" },
            { value: "∞", label: "ไม่จำกัด" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[var(--primary-500)] to-[var(--cyan-500)] bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-[var(--text-muted)] font-medium">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Trust Badge */}
        <motion.div 
          className="mt-12 flex items-center justify-center gap-2 text-sm text-[var(--text-muted)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex -space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-[var(--gold-500)] fill-[var(--gold-500)]" />
            ))}
          </div>
          <span>ได้รับความไว้วางใจจากผู้ใช้กว่า 10,000+ คน</span>
        </motion.div>
      </div>
    </section>
  )
}
