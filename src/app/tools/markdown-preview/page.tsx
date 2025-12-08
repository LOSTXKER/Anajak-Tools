"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { FileText, Eye, Code, ArrowLeft, Copy, Check } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const defaultMarkdown = `# Welcome to Markdown Preview

## What is Markdown?
Markdown is a **lightweight markup language** that you can use to add formatting elements to plaintext text documents.

### Features
- Easy to read and write
- Convert to HTML
- Widely supported

### Text Formatting
You can make text *italic*, **bold**, or ***both***.

### Code
Inline code: \`const greeting = "Hello World"\`

Code block:
\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

### Lists
**Unordered:**
- Item 1
- Item 2
  - Subitem 2.1
  - Subitem 2.2

**Ordered:**
1. First item
2. Second item
3. Third item

### Links
[Visit Google](https://google.com)

### Blockquotes
> This is a blockquote.
> It can span multiple lines.

### Tables
| Feature | Supported |
|---------|-----------|
| Headers | ✓ |
| Lists | ✓ |
| Code | ✓ |
| Tables | ✓ |

---

**Try editing the markdown on the left!**`

export default function MarkdownPreviewPage() {
  const [markdown, setMarkdown] = useState(defaultMarkdown)
  const [viewMode, setViewMode] = useState<'split' | 'preview' | 'edit'>('split')
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(markdown)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying:', error)
    }
  }

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
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-lg shadow-slate-500/20">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
                  Markdown Preview
                </h1>
                <p className="text-[var(--text-secondary)] mt-1">
                  เขียนและแสดงผล Markdown แบบเรียลไทม์
                </p>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <Button
                onClick={() => setViewMode('edit')}
                variant={viewMode === 'edit' ? 'primary' : 'secondary'}
                size="sm"
                className="flex-1 md:flex-initial"
              >
                <Code className="w-4 h-4" />
                Edit
              </Button>
              <Button
                onClick={() => setViewMode('split')}
                variant={viewMode === 'split' ? 'primary' : 'secondary'}
                size="sm"
                className="flex-1 md:flex-initial"
              >
                Split
              </Button>
              <Button
                onClick={() => setViewMode('preview')}
                variant={viewMode === 'preview' ? 'primary' : 'secondary'}
                size="sm"
                className="flex-1 md:flex-initial"
              >
                <Eye className="w-4 h-4" />
                Preview
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Editor & Preview */}
        <motion.div
          className={`grid gap-6 ${viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Editor */}
          {(viewMode === 'edit' || viewMode === 'split') && (
            <Card variant="glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="w-5 h-5 text-[var(--primary-500)]" />
                      Markdown Editor
                    </CardTitle>
                    <CardDescription>เขียน Markdown ที่นี่</CardDescription>
                  </div>
                  <Button
                    onClick={copyToClipboard}
                    variant="ghost"
                    size="sm"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span className="text-emerald-500">คัดลอกแล้ว</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        คัดลอก
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <textarea
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  rows={25}
                  className="w-full px-4 py-3 rounded-xl glass border border-[var(--glass-border)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] resize-none font-mono text-sm"
                  spellCheck={false}
                />
              </CardContent>
            </Card>
          )}

          {/* Preview */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-[var(--primary-500)]" />
                  Preview
                </CardTitle>
                <CardDescription>ผลลัพธ์ที่แสดง</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] min-h-[600px] overflow-auto markdown-preview">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {markdown}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Quick Guide */}
        <motion.div 
          className="mt-10 p-6 rounded-2xl glass border border-[var(--glass-border)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-bold text-[var(--text-primary)] mb-4">
            📖 Markdown Cheat Sheet
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-[var(--bg-surface)]">
              <p className="font-semibold text-[var(--text-primary)] mb-2">Headers</p>
              <code className="text-xs text-[var(--text-muted)] block"># H1</code>
              <code className="text-xs text-[var(--text-muted)] block">## H2</code>
              <code className="text-xs text-[var(--text-muted)] block">### H3</code>
            </div>
            <div className="p-3 rounded-lg bg-[var(--bg-surface)]">
              <p className="font-semibold text-[var(--text-primary)] mb-2">Emphasis</p>
              <code className="text-xs text-[var(--text-muted)] block">*italic*</code>
              <code className="text-xs text-[var(--text-muted)] block">**bold**</code>
              <code className="text-xs text-[var(--text-muted)] block">***both***</code>
            </div>
            <div className="p-3 rounded-lg bg-[var(--bg-surface)]">
              <p className="font-semibold text-[var(--text-primary)] mb-2">Lists</p>
              <code className="text-xs text-[var(--text-muted)] block">- Item</code>
              <code className="text-xs text-[var(--text-muted)] block">1. Item</code>
              <code className="text-xs text-[var(--text-muted)] block">- [ ] Task</code>
            </div>
            <div className="p-3 rounded-lg bg-[var(--bg-surface)]">
              <p className="font-semibold text-[var(--text-primary)] mb-2">Links</p>
              <code className="text-xs text-[var(--text-muted)] block">[text](url)</code>
            </div>
            <div className="p-3 rounded-lg bg-[var(--bg-surface)]">
              <p className="font-semibold text-[var(--text-primary)] mb-2">Code</p>
              <code className="text-xs text-[var(--text-muted)] block">`inline code`</code>
              <code className="text-xs text-[var(--text-muted)] block">```code block```</code>
            </div>
            <div className="p-3 rounded-lg bg-[var(--bg-surface)]">
              <p className="font-semibold text-[var(--text-primary)] mb-2">Blockquote</p>
              <code className="text-xs text-[var(--text-muted)] block">&gt; Quote</code>
            </div>
          </div>
        </motion.div>

        {/* Custom Styles for Markdown */}
        <style jsx global>{`
          .markdown-preview {
            color: var(--text-primary);
          }
          .markdown-preview h1,
          .markdown-preview h2,
          .markdown-preview h3,
          .markdown-preview h4 {
            color: var(--text-primary);
            margin-top: 1.5em;
            margin-bottom: 0.5em;
          }
          .markdown-preview h1 {
            border-bottom: 2px solid var(--border-default);
            padding-bottom: 0.3em;
          }
          .markdown-preview h2 {
            border-bottom: 1px solid var(--border-default);
            padding-bottom: 0.2em;
          }
          .markdown-preview code {
            background: var(--bg-surface);
            padding: 0.2em 0.4em;
            border-radius: 6px;
            font-size: 0.9em;
          }
          .markdown-preview pre {
            background: var(--bg-surface);
            border: 1px solid var(--border-default);
            padding: 1em;
            border-radius: 8px;
            overflow-x: auto;
          }
          .markdown-preview pre code {
            background: transparent;
            padding: 0;
          }
          .markdown-preview blockquote {
            border-left: 4px solid var(--primary-500);
            padding-left: 1em;
            color: var(--text-secondary);
            margin: 1em 0;
          }
          .markdown-preview table {
            border-collapse: collapse;
            width: 100%;
            margin: 1em 0;
          }
          .markdown-preview th,
          .markdown-preview td {
            border: 1px solid var(--border-default);
            padding: 0.5em;
            text-align: left;
          }
          .markdown-preview th {
            background: var(--bg-surface);
            font-weight: bold;
          }
          .markdown-preview a {
            color: var(--primary-500);
            text-decoration: underline;
          }
          .markdown-preview a:hover {
            color: var(--primary-600);
          }
        `}</style>
      </div>
    </div>
  )
}



