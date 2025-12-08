"use client"

import { useState, useEffect } from 'react'

interface PageThumbnail {
  pageNumber: number
  dataUrl: string
}

export function usePDFThumbnails(file: File | null) {
  const [thumbnails, setThumbnails] = useState<Map<number, string>>(new Map())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      setThumbnails(new Map())
      return
    }

    let isCancelled = false

    const loadThumbnails = async () => {
      setLoading(true)
      setError(null)

      try {
        // Dynamic import to avoid SSR issues
        const pdfjsLib = await import('pdfjs-dist')
        
        // Configure worker - use unpkg CDN which has all versions
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

        const newThumbnails = new Map<number, string>()

        // Generate thumbnails for each page
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          if (isCancelled) break

          try {
            const page = await pdf.getPage(pageNum)
            const viewport = page.getViewport({ scale: 0.5 })

            const canvas = document.createElement('canvas')
            const context = canvas.getContext('2d')
            if (!context) continue

            canvas.width = viewport.width
            canvas.height = viewport.height

            await page.render({
              canvasContext: context,
              viewport: viewport,
              canvas: canvas,
            } as any).promise

            const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
            newThumbnails.set(pageNum, dataUrl)

            // Update state incrementally for better UX
            if (!isCancelled) {
              setThumbnails(new Map(newThumbnails))
            }
          } catch (pageError) {
            console.error(`Error rendering page ${pageNum}:`, pageError)
          }
        }

        if (!isCancelled) {
          setLoading(false)
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Error loading PDF:', err)
          setError('ไม่สามารถโหลด PDF ได้')
          setLoading(false)
        }
      }
    }

    loadThumbnails()

    return () => {
      isCancelled = true
    }
  }, [file])

  return { thumbnails, loading, error }
}
