import { 
  FileText, 
  Image, 
  Calculator,
  QrCode,
  Code,
  Globe,
  Sparkles,
  Zap,
  type LucideIcon
} from "lucide-react"

export interface Tool {
  id: string
  name: string
  nameEn: string
  nameTh: string
  description: string
  descriptionTh: string
  icon: LucideIcon
  category: ToolCategory
  path: string
  isPremium?: boolean
  isNew?: boolean
  isBeta?: boolean
  tags: string[]
}

export type ToolCategory = 
  | "pdf"
  | "image"
  | "finance"
  | "qr-barcode"
  | "developer"
  | "text"
  | "ai"
  | "generator"
  | "converter"
  | "calculator"
  | "other"

export const toolCategories: Record<ToolCategory, { 
  name: string
  nameTh: string
  icon: LucideIcon
  color: string
}> = {
  pdf: {
    name: "PDF Tools",
    nameTh: "เครื่องมือ PDF",
    icon: FileText,
    color: "from-[var(--primary-500)] to-[var(--primary-600)]"
  },
  image: {
    name: "Image Tools",
    nameTh: "เครื่องมือรูปภาพ",
    icon: Image,
    color: "from-[var(--cyan-500)] to-[var(--cyan-600)]"
  },
  finance: {
    name: "Finance Tools",
    nameTh: "เครื่องมือการเงิน",
    icon: Calculator,
    color: "from-[var(--gold-500)] to-[var(--gold-600)]"
  },
  "qr-barcode": {
    name: "QR & Barcode",
    nameTh: "QR & บาร์โค้ด",
    icon: QrCode,
    color: "from-emerald-500 to-emerald-600"
  },
  developer: {
    name: "Developer Tools",
    nameTh: "เครื่องมือนักพัฒนา",
    icon: Code,
    color: "from-purple-500 to-purple-600"
  },
  text: {
    name: "Text Tools",
    nameTh: "เครื่องมือข้อความ",
    icon: Globe,
    color: "from-blue-500 to-blue-600"
  },
  ai: {
    name: "AI Tools",
    nameTh: "เครื่องมือ AI",
    icon: Sparkles,
    color: "from-pink-500 to-pink-600"
  },
  generator: {
    name: "Generators",
    nameTh: "เครื่องมือสร้าง",
    icon: Zap,
    color: "from-orange-500 to-orange-600"
  },
  converter: {
    name: "Converters",
    nameTh: "เครื่องมือแปลง",
    icon: FileText,
    color: "from-indigo-500 to-indigo-600"
  },
  calculator: {
    name: "Calculators",
    nameTh: "เครื่องคำนวณ",
    icon: Calculator,
    color: "from-teal-500 to-teal-600"
  },
  other: {
    name: "Other Tools",
    nameTh: "อื่นๆ",
    icon: Zap,
    color: "from-slate-500 to-slate-600"
  }
}

// Tool Registry
export const tools: Tool[] = [
  // ═══════════════════════════════════════════════════════════════
  // PDF TOOLS
  // ═══════════════════════════════════════════════════════════════
  {
    id: "pdf-merge",
    name: "PDF Merge",
    nameEn: "PDF Merge",
    nameTh: "รวม PDF",
    description: "Combine multiple PDF files into one",
    descriptionTh: "รวมไฟล์ PDF หลายไฟล์เป็นไฟล์เดียว",
    icon: FileText,
    category: "pdf",
    path: "/tools/pdf-merge",
    tags: ["pdf", "merge", "combine", "รวม"]
  },
  {
    id: "pdf-split",
    name: "PDF Split",
    nameEn: "PDF Split",
    nameTh: "แยก PDF",
    description: "Split PDF into multiple files",
    descriptionTh: "แยกไฟล์ PDF เป็นหลายไฟล์",
    icon: FileText,
    category: "pdf",
    path: "/tools/pdf-split",
    tags: ["pdf", "split", "separate", "แยก"]
  },
  {
    id: "pdf-compress",
    name: "PDF Compress",
    nameEn: "PDF Compress",
    nameTh: "บีบอัด PDF",
    description: "Reduce PDF file size",
    descriptionTh: "ลดขนาดไฟล์ PDF",
    icon: FileText,
    category: "pdf",
    path: "/tools/pdf-compress",
    tags: ["pdf", "compress", "reduce", "บีบอัด"]
  },
  {
    id: "pdf-unlock",
    name: "PDF Unlock",
    nameEn: "PDF Unlock",
    nameTh: "ปลดล็อค PDF",
    description: "Remove password from PDF files",
    descriptionTh: "ถอดรหัสผ่าน PDF (รองรับหลายไฟล์)",
    icon: FileText,
    category: "pdf",
    path: "/tools/pdf-unlock",
    tags: ["pdf", "unlock", "password", "ปลดล็อค", "รหัสผ่าน"]
  },
  {
    id: "pdf-to-image",
    name: "PDF to Image",
    nameEn: "PDF to Image",
    nameTh: "PDF เป็นรูปภาพ",
    description: "Convert PDF pages to images",
    descriptionTh: "แปลงหน้า PDF เป็นรูปภาพ",
    icon: FileText,
    category: "pdf",
    path: "/tools/pdf-to-image",
    tags: ["pdf", "image", "convert", "แปลง"]
  },
  {
    id: "image-to-pdf",
    name: "Image to PDF",
    nameEn: "Image to PDF",
    nameTh: "รูปภาพเป็น PDF",
    description: "Convert images to PDF",
    descriptionTh: "แปลงรูปภาพเป็น PDF",
    icon: Image,
    category: "pdf",
    path: "/tools/image-to-pdf",
    tags: ["image", "pdf", "convert", "แปลง"]
  },

  // ═══════════════════════════════════════════════════════════════
  // IMAGE TOOLS
  // ═══════════════════════════════════════════════════════════════
  {
    id: "bg-remove",
    name: "Background Remover",
    nameEn: "Background Remover",
    nameTh: "ลบพื้นหลัง",
    description: "Remove image background with AI",
    descriptionTh: "ลบพื้นหลังรูปภาพด้วย AI",
    icon: Image,
    category: "image",
    path: "/tools/bg-remove",
    isNew: true,
    tags: ["image", "background", "remove", "ai", "ลบพื้นหลัง"]
  },
  {
    id: "image-resize",
    name: "Image Resize",
    nameEn: "Image Resize",
    nameTh: "ปรับขนาดรูปภาพ",
    description: "Resize images to any dimension",
    descriptionTh: "ปรับขนาดรูปภาพ",
    icon: Image,
    category: "image",
    path: "/tools/image-resize",
    tags: ["image", "resize", "scale", "ปรับขนาด"]
  },
  {
    id: "image-compress",
    name: "Image Compress",
    nameEn: "Image Compress",
    nameTh: "บีบอัดรูปภาพ",
    description: "Compress images without quality loss",
    descriptionTh: "บีบอัดรูปภาพโดยไม่เสียคุณภาพ",
    icon: Image,
    category: "image",
    path: "/tools/image-compress",
    tags: ["image", "compress", "optimize", "บีบอัด"]
  },
  {
    id: "image-converter",
    name: "Image Format Converter",
    nameEn: "Image Format Converter",
    nameTh: "แปลงรูปแบบรูปภาพ",
    description: "Convert images between PNG, JPEG, WebP",
    descriptionTh: "แปลงรูปภาพระหว่าง PNG, JPEG, WebP",
    icon: Image,
    category: "image",
    path: "/tools/image-converter",
    tags: ["image", "convert", "format", "แปลง"]
  },

  // ═══════════════════════════════════════════════════════════════
  // AI TOOLS
  // ═══════════════════════════════════════════════════════════════
  {
    id: "ai-chat",
    name: "AI Chat",
    nameEn: "AI Chat",
    nameTh: "แชท AI",
    description: "Chat with AI assistant",
    descriptionTh: "สนทนากับผู้ช่วย AI",
    icon: Sparkles,
    category: "ai",
    path: "/tools/ai-chat",
    tags: ["ai", "chat", "assistant", "แชท"]
  },
  {
    id: "pdf-summarize",
    name: "PDF Summarize",
    nameEn: "PDF Summarize",
    nameTh: "สรุป PDF",
    description: "Summarize PDF with AI",
    descriptionTh: "สรุปเนื้อหา PDF ด้วย AI",
    icon: Sparkles,
    category: "ai",
    path: "/tools/pdf-summarize",
    isPremium: true,
    tags: ["ai", "pdf", "summarize", "สรุป"]
  },

  // ═══════════════════════════════════════════════════════════════
  // QR & BARCODE
  // ═══════════════════════════════════════════════════════════════
  {
    id: "qr-generator",
    name: "QR Code Generator",
    nameEn: "QR Code Generator",
    nameTh: "สร้าง QR Code",
    description: "Generate QR codes for any content",
    descriptionTh: "สร้าง QR Code จากข้อความ URL หรืออื่นๆ",
    icon: QrCode,
    category: "qr-barcode",
    path: "/tools/qr-generator",
    tags: ["qr", "generator", "barcode", "สร้าง"]
  },

  // ═══════════════════════════════════════════════════════════════
  // DEVELOPER TOOLS
  // ═══════════════════════════════════════════════════════════════
  {
    id: "json-formatter",
    name: "JSON Formatter",
    nameEn: "JSON Formatter",
    nameTh: "จัดรูปแบบ JSON",
    description: "Format and validate JSON",
    descriptionTh: "จัดรูปแบบและตรวจสอบ JSON",
    icon: Code,
    category: "developer",
    path: "/tools/json-formatter",
    tags: ["json", "formatter", "developer", "dev"]
  },
  {
    id: "base64",
    name: "Base64 Encoder/Decoder",
    nameEn: "Base64 Encoder/Decoder",
    nameTh: "เข้ารหัส/ถอดรหัส Base64",
    description: "Encode and decode Base64",
    descriptionTh: "เข้ารหัสและถอดรหัส Base64",
    icon: Code,
    category: "developer",
    path: "/tools/base64",
    tags: ["base64", "encode", "decode", "developer"]
  },
  {
    id: "hash-generator",
    name: "Hash Generator",
    nameEn: "Hash Generator",
    nameTh: "สร้าง Hash",
    description: "Generate MD5, SHA-1, SHA-256, SHA-384, SHA-512 hashes",
    descriptionTh: "สร้าง Hash ด้วย MD5, SHA-1, SHA-256, SHA-384, SHA-512",
    icon: Code,
    category: "developer",
    path: "/tools/hash-generator",
    tags: ["hash", "md5", "sha", "security", "developer"]
  },
  {
    id: "url-encoder",
    name: "URL Encoder/Decoder",
    nameEn: "URL Encoder/Decoder",
    nameTh: "เข้ารหัส/ถอดรหัส URL",
    description: "Encode and decode URLs",
    descriptionTh: "เข้ารหัสและถอดรหัส URL",
    icon: Code,
    category: "developer",
    path: "/tools/url-encoder",
    tags: ["url", "encode", "decode", "developer"]
  },

  // ═══════════════════════════════════════════════════════════════
  // TEXT TOOLS
  // ═══════════════════════════════════════════════════════════════
  {
    id: "word-counter",
    name: "Word Counter",
    nameEn: "Word Counter",
    nameTh: "นับคำ",
    description: "Count words, characters, and analyze text",
    descriptionTh: "นับคำ ตัวอักษร และวิเคราะห์ข้อความ",
    icon: Globe,
    category: "text",
    path: "/tools/word-counter",
    tags: ["word", "count", "text", "analyze", "นับคำ"]
  },
  {
    id: "case-converter",
    name: "Case Converter",
    nameEn: "Case Converter",
    nameTh: "แปลงตัวพิมพ์",
    description: "Convert text between different cases",
    descriptionTh: "แปลงรูปแบบตัวพิมพ์ต่างๆ",
    icon: Globe,
    category: "text",
    path: "/tools/case-converter",
    tags: ["case", "convert", "uppercase", "lowercase", "camelCase"]
  },
  {
    id: "markdown-preview",
    name: "Markdown Preview",
    nameEn: "Markdown Preview",
    nameTh: "แสดง Markdown",
    description: "Write and preview Markdown in real-time",
    descriptionTh: "เขียนและแสดงผล Markdown แบบเรียลไทม์",
    icon: Globe,
    category: "text",
    path: "/tools/markdown-preview",
    tags: ["markdown", "preview", "editor", "md"]
  },

  // ═══════════════════════════════════════════════════════════════
  // GENERATORS
  // ═══════════════════════════════════════════════════════════════
  {
    id: "password-generator",
    name: "Password Generator",
    nameEn: "Password Generator",
    nameTh: "สร้างรหัสผ่าน",
    description: "Generate strong and secure passwords",
    descriptionTh: "สร้างรหัสผ่านที่แข็งแรงและปลอดภัย",
    icon: Zap,
    category: "generator",
    path: "/tools/password-generator",
    tags: ["password", "generator", "security", "รหัสผ่าน"]
  },
  {
    id: "color-picker",
    name: "Color Picker",
    nameEn: "Color Picker",
    nameTh: "เลือกสี",
    description: "Pick colors and convert between formats",
    descriptionTh: "เลือกสีและแปลงรูปแบบต่างๆ",
    icon: Zap,
    category: "generator",
    path: "/tools/color-picker",
    tags: ["color", "picker", "hex", "rgb", "สี"]
  },
  {
    id: "uuid-generator",
    name: "UUID Generator",
    nameEn: "UUID Generator",
    nameTh: "สร้าง UUID",
    description: "Generate UUIDs (v1 & v4)",
    descriptionTh: "สร้าง UUID (Universally Unique Identifier)",
    icon: Zap,
    category: "generator",
    path: "/tools/uuid-generator",
    tags: ["uuid", "generator", "unique", "id"]
  },
  {
    id: "lorem-generator",
    name: "Lorem Ipsum Generator",
    nameEn: "Lorem Ipsum Generator",
    nameTh: "สร้าง Lorem Ipsum",
    description: "Generate Lorem Ipsum placeholder text",
    descriptionTh: "สร้างข้อความ Lorem Ipsum สำหรับ mockup",
    icon: Zap,
    category: "generator",
    path: "/tools/lorem-generator",
    tags: ["lorem", "ipsum", "text", "placeholder", "generator"]
  },
]

// Helper functions
export function getToolById(id: string): Tool | undefined {
  return tools.find(tool => tool.id === id)
}

export function getToolsByCategory(category: ToolCategory): Tool[] {
  return tools.filter(tool => tool.category === category)
}

export function searchTools(query: string): Tool[] {
  const lowerQuery = query.toLowerCase()
  return tools.filter(tool => 
    tool.name.toLowerCase().includes(lowerQuery) ||
    tool.nameTh.toLowerCase().includes(lowerQuery) ||
    tool.description.toLowerCase().includes(lowerQuery) ||
    tool.descriptionTh.toLowerCase().includes(lowerQuery) ||
    tool.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  )
}

export function getAllCategories(): ToolCategory[] {
  return Object.keys(toolCategories) as ToolCategory[]
}

