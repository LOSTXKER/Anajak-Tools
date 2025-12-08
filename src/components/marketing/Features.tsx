"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { 
  FileText, 
  Image, 
  Calculator,
  QrCode,
  Code,
  Globe,
  Sparkles,
  Zap,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

const toolCategories = [
  {
    icon: FileText,
    title: "PDF Tools",
    description: "รวม แยก บีบอัด แปลง PDF",
    color: "from-[var(--primary-500)] to-[var(--primary-600)]",
    bgColor: "bg-[var(--primary-500)]/10",
    tools: ["รวม PDF", "แยก PDF", "บีบอัด PDF", "PDF เป็นรูปภาพ"],
    link: "/tools?category=pdf"
  },
  {
    icon: Image,
    title: "Image Tools",
    description: "ปรับขนาด บีบอัด ลบพื้นหลัง",
    color: "from-[var(--cyan-500)] to-[var(--cyan-600)]",
    bgColor: "bg-[var(--cyan-500)]/10",
    tools: ["ปรับขนาดรูปภาพ", "บีบอัดรูปภาพ", "ลบพื้นหลัง", "แปลงรูปภาพ"],
    link: "/tools?category=image"
  },
  {
    icon: Calculator,
    title: "Finance Tools",
    description: "คำนวณภาษี ออกใบเสร็จ ใบกำกับภาษี",
    color: "from-[var(--gold-500)] to-[var(--gold-600)]",
    bgColor: "bg-[var(--gold-500)]/10",
    tools: ["คำนวณภาษี", "ออกใบกำกับภาษี", "สแกนใบเสร็จ", "หัก ณ ที่จ่าย"],
    link: "/tools?category=finance"
  },
  {
    icon: QrCode,
    title: "QR & Barcode",
    description: "สร้างและสแกน QR Code",
    color: "from-emerald-500 to-emerald-600",
    bgColor: "bg-emerald-500/10",
    tools: ["สร้าง QR Code", "สแกน QR Code", "สร้าง Barcode", "ย่อ URL"],
    link: "/tools/qr-generator"
  },
  {
    icon: Code,
    title: "Developer Tools",
    description: "JSON, Base64, Hash และอื่นๆ",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-500/10",
    tools: ["JSON Formatter", "Base64 Encoder", "Hash Generator", "Regex Tester"],
    link: "/tools/json-formatter"
  },
  {
    icon: Sparkles,
    title: "AI Assistant",
    description: "ถามคำถาม วิเคราะห์เอกสาร",
    color: "from-pink-500 to-pink-600",
    bgColor: "bg-pink-500/10",
    tools: ["AI Chat", "สรุปเอกสาร", "วิเคราะห์รูปภาพ", "ถาม-ตอบอัจฉริยะ"],
    link: "/tools?category=ai"
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
}

export function Features() {
  return (
    <section className="py-24 px-4 relative">
      {/* Background Decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-0 w-1/3 h-96 bg-gradient-to-r from-[var(--primary-500)]/5 to-transparent blur-3xl" />
        <div className="absolute top-1/3 right-0 w-1/3 h-96 bg-gradient-to-l from-[var(--cyan-500)]/5 to-transparent blur-3xl" />
      </div>

      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-[var(--primary-500)]/10 text-[var(--primary-500)] mb-4">
            เครื่องมือทั้งหมด
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[var(--primary-500)] to-[var(--cyan-500)] bg-clip-text text-transparent">
              เครื่องมือครบ
            </span>
            <span className="text-[var(--text-primary)]"> จบในที่เดียว</span>
          </h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            80+ เครื่องมือที่คุณต้องการ พร้อมใช้งานทันที ไม่ต้องลงโปรแกรม
          </p>
        </motion.div>

        {/* Tools Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {toolCategories.map((category, index) => {
            const Icon = category.icon
            return (
              <motion.div key={index} variants={itemVariants}>
                <Link href={category.link}>
                  <Card 
                    variant="glass" 
                    className="group h-full cursor-pointer border border-[var(--glass-border)] hover:border-[var(--primary-500)]/30 transition-all duration-300"
                  >
                    <CardContent className="pt-6">
                      {/* Icon & Title Row */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1 group-hover:text-[var(--primary-500)] transition-colors">
                            {category.title}
                          </h3>
                          <p className="text-sm text-[var(--text-secondary)]">
                            {category.description}
                          </p>
                        </div>
                      </div>

                      {/* Tools List */}
                      <div className="space-y-2 mb-4">
                        {category.tools.map((tool, i) => (
                          <div 
                            key={i} 
                            className="flex items-center gap-2 text-sm text-[var(--text-muted)]"
                          >
                            <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${category.color}`} />
                            <span>{tool}</span>
                          </div>
                        ))}
                      </div>

                      {/* Action */}
                      <div className="flex items-center text-[var(--primary-500)] font-medium text-sm group-hover:gap-2 transition-all">
                        <span>ใช้งานเลย</span>
                        <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>

        {/* CTA */}
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link href="/tools">
            <Button size="lg" variant="secondary" className="group">
              ดูเครื่องมือทั้งหมด 80+ รายการ
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
