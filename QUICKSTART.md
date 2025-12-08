# 🚀 Quick Start Guide - Anajak Tools

## การเริ่มต้นใช้งาน

### 1. ติดตั้ง Dependencies

```bash
npm install
```

### 2. ตั้งค่า Environment Variables

สร้างไฟล์ `.env.local` ในโฟลเดอร์ root:

```bash
# สร้างไฟล์
New-Item .env.local -ItemType File

# หรือใน Linux/Mac
touch .env.local
```

เพิ่มข้อมูลใน `.env.local`:

```env
# ============================================
# 🤖 AI - Google Gemini (Required for AI features)
# รับ API key ฟรีที่: https://aistudio.google.com/apikey
# ============================================
GEMINI_API_KEY=your-gemini-api-key-here

# ============================================
# 🔥 Firebase (Optional - for authentication)
# ============================================
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# ============================================
# 🔐 NextAuth (Optional)
# ============================================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# ============================================
# 📱 App Configuration
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Anajak Tools"
```

### 3. รัน Development Server

```bash
npm run dev
```

เปิดเว็บที่: **http://localhost:3000**

---

## 🔧 แก้ไขปัญหาที่พบบ่อย

### ปัญหา: Module not found หรือ Build Error

**วิธีแก้:**

```bash
# 1. หยุด dev server (Ctrl + C)

# 2. ลบ cache
Remove-Item .next -Recurse -Force -ErrorAction SilentlyContinue

# 3. Install dependencies ใหม่
npm install

# 4. รัน dev server
npm run dev
```

### ปัญหา: AI Chat ไม่ทำงาน

**สาเหตุ:** ยังไม่ได้ตั้งค่า `GEMINI_API_KEY`

**วิธีแก้:**
1. ไปที่ https://aistudio.google.com/apikey
2. สร้าง API key (ฟรี)
3. เพิ่มใน `.env.local`:
   ```env
   GEMINI_API_KEY=your-actual-api-key-here
   ```
4. Restart dev server

### ปัญหา: Port 3000 ถูกใช้งานอยู่

**วิธีแก้:**

```bash
# รันที่ port อื่น
npm run dev -- -p 3001
```

---

## 📁 โครงสร้างโปรเจค

```
anajak-tools/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/
│   │   │   └── chat/          # AI Chat API endpoint
│   │   ├── tools/             # หน้าเครื่องมือต่างๆ
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Landing page
│   │   └── globals.css        # Design system
│   │
│   ├── components/
│   │   ├── ui/                # Base components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── ChatButton.tsx # AI Chat UI
│   │   ├── marketing/         # Landing page components
│   │   │   ├── Hero.tsx
│   │   │   └── Features.tsx
│   │   └── layout/            # Layout components
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── ClientLayout.tsx
│   │
│   └── lib/
│       ├── tools/
│       │   └── registry.ts    # Tool registry (เพิ่ม tool ใหม่ที่นี่)
│       ├── firebase.ts        # Firebase configuration
│       └── utils.ts           # Utility functions
│
├── public/                    # Static files
├── .env.local                 # Environment variables (สร้างเอง)
├── package.json
└── README.md
```

---

## ✨ Features ที่ใช้งานได้

### ✅ พร้อมใช้งาน

- 🏠 **Landing Page** - Hero section + Features
- 🔧 **Tools Page** (/tools) - แสดงเครื่องมือทั้งหมด
- 🤖 **AI Chat Button** - มุมล่างขวา (ต้องมี API key)
- 🎨 **Dark/Light Theme** - ตาม system preference
- 📱 **Responsive Design** - ใช้งานได้ทุกอุปกรณ์
- 🔍 **Search & Filter** - ค้นหาเครื่องมือได้

### 🚧 กำลังพัฒนา

- 🔐 Firebase Authentication
- 📄 PDF Tools (Merge, Split, Compress)
- 🖼️ Image Tools (Resize, Compress, BG Remove)
- 💰 Finance Tools (Tax, Invoice)
- 💳 Payment Integration

---

## 🎨 Design System

### สี (Colors)

- **Primary**: Purple (#8B5CF6) - ม่วงหลวง
- **Secondary**: Gold (#F59E0B) - ทองหลวง  
- **Accent**: Cyan (#06B6D4) - ไซแอน
- **Success**: Emerald (#10B981)
- **Error**: Red (#EF4444)

### Typography

- **Display**: Space Grotesk
- **Body**: Inter
- **Mono**: JetBrains Mono
- **Thai**: Noto Sans Thai

### Theme

- **Dark Mode**: "Midnight Kingdom" (default)
- **Light Mode**: "Crystal Palace"

---

## 📚 การเพิ่มเครื่องมือใหม่

### Step 1: เพิ่มใน Tool Registry

แก้ไขไฟล์ `src/lib/tools/registry.ts`:

```typescript
{
  id: "my-new-tool",
  name: "My New Tool",
  nameEn: "My New Tool",
  nameTh: "เครื่องมือใหม่",
  description: "Tool description",
  descriptionTh: "คำอธิบายเป็นภาษาไทย",
  icon: YourIcon,  // จาก lucide-react
  category: "pdf",  // หรือ category อื่น
  path: "/tools/my-new-tool",
  tags: ["tag1", "tag2"]
}
```

### Step 2: สร้างหน้า Tool

สร้างไฟล์ `src/app/tools/my-new-tool/page.tsx`:

```typescript
export default function MyNewToolPage() {
  return (
    <div className="container mx-auto py-20 px-4">
      <h1 className="heading-1 mb-8">เครื่องมือใหม่</h1>
      {/* UI ของ tool */}
    </div>
  )
}
```

เครื่องมือใหม่จะปรากฏใน Tools page อัตโนมัติ! ✨

---

## 🎯 Scripts

```bash
npm run dev      # Development server (http://localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 🆘 ต้องการความช่วยเหลือ?

- 📖 Documentation: [README.md](./README.md)
- 🐛 Issues: สร้าง issue ใน GitHub
- 💬 ติดต่อ: hello@anajak.tools

---

**Happy Coding! 🚀**

Made with ❤️ in Thailand 🇹🇭



