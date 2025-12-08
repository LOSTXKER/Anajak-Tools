# 🔧 Anajak Tools - เครื่องมือครบ จบในที่เดียว

> **อนาจักร** = "อาณาจักร" ของเครื่องมือ | Your Kingdom of Tools

แพลตฟอร์ม SaaS ที่รวม tools อำนวยความสะดวกกว่า 80+ เครื่องมือ พร้อม AI ช่วยเหลือ สำหรับทุกคน ทุกธุรกิจ

## ✨ Features

- 🤖 **AI Assistant** - Powered by Google Gemini
- 📄 **PDF Tools** - Merge, Split, Compress, Convert
- 🖼️ **Image Tools** - Resize, Compress, Background Removal
- 💰 **Finance Tools** - Tax Calculator, Invoice Generator
- 📱 **QR & Barcode** - Generate and Scan
- 💻 **Developer Tools** - JSON Formatter, Base64, Hash
- 🌐 **Text Tools** - Translator, Summarizer
- ⚡ **80+ Tools** - และอื่นๆ อีกมากมาย

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/anajak-tools.git
cd anajak-tools

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local and add your API keys
# You'll need at least GEMINI_API_KEY to use AI features

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🔑 Environment Variables

Get your API keys from:

- **Google Gemini**: https://aistudio.google.com/apikey (Free tier available)
- **Firebase**: https://console.firebase.google.com/ (Optional, for auth)

Minimum required for AI features:
```env
GEMINI_API_KEY=your-api-key-here
```

## 🎨 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI
- **AI**: Vercel AI SDK + Google Gemini
- **State Management**: Zustand
- **Animation**: Framer Motion
- **PDF Processing**: pdf-lib
- **Image Processing**: Client-side processing

## 📁 Project Structure

```
anajak-tools/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── api/          # API routes
│   │   │   └── chat/     # AI chat endpoint
│   │   ├── tools/        # Tools pages
│   │   └── page.tsx      # Landing page
│   ├── components/
│   │   ├── ui/           # Reusable UI components
│   │   ├── marketing/    # Landing page components
│   │   ├── layout/       # Layout components
│   │   └── tools/        # Tool-specific components
│   └── lib/
│       ├── tools/        # Tool registry
│       ├── firebase.ts   # Firebase config
│       └── utils.ts      # Utility functions
├── public/               # Static assets
└── package.json
```

## 🛠️ Adding New Tools

Adding a new tool is easy! Just:

1. **Add to registry** (`src/lib/tools/registry.ts`):

```typescript
{
  id: "my-tool",
  name: "My Tool",
  nameTh: "เครื่องมือของฉัน",
  description: "Tool description",
  descriptionTh: "คำอธิบายเครื่องมือ",
  icon: YourIcon,
  category: "pdf", // or other category
  path: "/tools/my-tool",
  tags: ["tag1", "tag2"]
}
```

2. **Create tool page** (`src/app/tools/my-tool/page.tsx`):

```typescript
export default function MyToolPage() {
  return (
    <div className="container mx-auto py-20">
      <h1 className="heading-1">My Tool</h1>
      {/* Your tool UI */}
    </div>
  )
}
```

That's it! Your tool will automatically appear in the tools list. 🎉

## 🎯 Design System

- **Colors**: Royal Purple + Gold + Cyan
- **Theme**: Dark mode (Midnight Kingdom) by default
- **Typography**: Inter + Space Grotesk + JetBrains Mono + Noto Sans Thai
- **Components**: Glass morphism, gradients, smooth animations

All design tokens are in `src/app/globals.css`.

## 📝 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🔒 Security

- All file processing happens client-side (your files never leave your browser)
- API keys are stored securely in environment variables
- AI requests are sent to secure API routes only

## 📄 License

MIT License - feel free to use this project!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

- Website: https://anajak.tools
- Email: hello@anajak.tools
- Twitter: @anajaktools

---

Made with ❤️ in Thailand 🇹🇭
