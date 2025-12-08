"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { tools, toolCategories, searchTools, type ToolCategory } from "@/lib/tools/registry"
import { Search, ArrowRight, Star, Sparkles, Crown } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

export default function ToolsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | "all">("all")

  const filteredTools = searchQuery 
    ? searchTools(searchQuery)
    : selectedCategory === "all" 
      ? tools 
      : tools.filter(tool => tool.category === selectedCategory)

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-[var(--primary-500)]/10 text-[var(--primary-500)] mb-4">
            🛠️ เครื่องมือทั้งหมด
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[var(--primary-500)] to-[var(--cyan-500)] bg-clip-text text-transparent">
              เครื่องมือทั้งหมด
            </span>
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            เลือกเครื่องมือที่คุณต้องการใช้งาน ทั้งหมดฟรี ไม่จำกัด
          </p>
        </motion.div>

        {/* Search */}
        <motion.div 
          className="max-w-2xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="ค้นหาเครื่องมือ... (เช่น PDF, QR Code, รูปภาพ)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl glass border border-[var(--glass-border)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent transition-all text-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            )}
          </div>
        </motion.div>

        {/* Category Filter */}
        <motion.div 
          className="flex flex-wrap gap-2 justify-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              selectedCategory === "all"
                ? "bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] text-white shadow-lg shadow-[var(--primary-500)]/20"
                : "glass border border-[var(--glass-border)] text-[var(--text-secondary)] hover:border-[var(--primary-500)] hover:text-[var(--primary-500)]"
            }`}
          >
            ทั้งหมด ({tools.length})
          </button>
          {Object.entries(toolCategories).map(([key, category]) => {
            const count = tools.filter(t => t.category === key).length
            if (count === 0) return null
            
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key as ToolCategory)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  selectedCategory === key
                    ? "bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] text-white shadow-lg shadow-[var(--primary-500)]/20"
                    : "glass border border-[var(--glass-border)] text-[var(--text-secondary)] hover:border-[var(--primary-500)] hover:text-[var(--primary-500)]"
                }`}
              >
                {category.nameTh} ({count})
              </button>
            )
          })}
        </motion.div>

        {/* Tools Grid */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={selectedCategory + searchQuery}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {filteredTools.map((tool, index) => {
              const Icon = tool.icon
              const category = toolCategories[tool.category]
              
              return (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link href={tool.path}>
                    <Card 
                      variant="glass" 
                      className="group h-full cursor-pointer border border-[var(--glass-border)] hover:border-[var(--primary-500)]/30 transition-all duration-300 overflow-hidden"
                    >
                      {/* Hover Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-500)]/0 to-[var(--cyan-500)]/0 group-hover:from-[var(--primary-500)]/5 group-hover:to-[var(--cyan-500)]/5 transition-all duration-300" />
                      
                      <CardContent className="pt-6 relative">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex gap-1.5">
                            {tool.isNew && (
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-semibold flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                New
                              </span>
                            )}
                            {tool.isPremium && (
                              <span className="px-2.5 py-1 rounded-lg bg-[var(--gold-500)]/10 text-[var(--gold-500)] text-xs font-semibold flex items-center gap-1">
                                <Crown className="w-3 h-3" />
                                Pro
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Content */}
                        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--primary-500)] transition-colors">
                          {tool.nameTh}
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2">
                          {tool.descriptionTh}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-default)]">
                          <span className="text-xs text-[var(--text-muted)] px-2 py-1 rounded-md bg-[var(--bg-surface)]">
                            {category.nameTh}
                          </span>
                          <div className="flex items-center text-[var(--primary-500)] font-medium text-sm group-hover:gap-2 transition-all">
                            <span>ใช้งาน</span>
                            <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        </AnimatePresence>

        {/* No Results */}
        {filteredTools.length === 0 && (
          <motion.div 
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-24 h-24 rounded-3xl glass border border-[var(--glass-border)] flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-[var(--text-muted)]" />
            </div>
            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
              ไม่พบเครื่องมือ
            </h3>
            <p className="text-[var(--text-secondary)] mb-6">
              ลองค้นหาด้วยคำอื่นหรือเลือกหมวดหมู่อื่น
            </p>
            <Button onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}>
              ล้างการค้นหา
            </Button>
          </motion.div>
        )}

        {/* Results Count */}
        {filteredTools.length > 0 && (
          <motion.p 
            className="text-center text-[var(--text-muted)] mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            แสดง {filteredTools.length} เครื่องมือ
          </motion.p>
        )}
      </div>
    </div>
  )
}
