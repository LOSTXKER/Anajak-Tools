"use client"

import { useState, useEffect, useCallback, useRef } from 'react'

interface UsePDFThumbnailsResult {
  thumbnails: Map<number, string>      // Small thumbnails for grid
  fullImages: Map<number, string>      // High-res images for lightbox
  loading: boolean
  error: string | null
  loadFullImage: (pageNumber: number) => Promise<void>
}

export function usePDFThumbnails(file: File | null): UsePDFThumbnailsResult {
  const [thumbnails, setThumbnails] = useState<Map<number, string>>(new Map())
  const [fullImages, setFullImages] = useState<Map<number, string>>(new Map())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Store PDF document reference for on-demand loading
  const pdfDocRef = useRef<any>(null)
  const pdfjsRef = useRef<any>(null)

  // Load full resolution image on demand (for lightbox)
  const loadFullImage = useCallback(async (pageNumber: number) => {
    // Skip if already loaded or PDF not ready
    if (fullImages.has(pageNumber) || !pdfDocRef.current || !pdfjsRef.current) {
      return
    }

    try {
      const page = await pdfDocRef.current.getPage(pageNumber)
      // Use scale 2.0 for high resolution (4x the pixels of 0.5)
      const viewport = page.getViewport({ scale: 2.0 })

      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      if (!context) return

      canvas.width = viewport.width
      canvas.height = viewport.height

      await page.render({
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
      } as any).promise

      // High quality JPEG
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95)

      setFullImages(prev => {
        const newMap = new Map(prev)
        newMap.set(pageNumber, dataUrl)
        return newMap
      })
    } catch (err) {
      console.error('Error loading full image:', err)
    }
  }, [fullImages])

  useEffect(() => {
    if (!file) {
      setThumbnails(new Map())
      setFullImages(new Map())
      setLoading(false)
      setError(null)
      pdfDocRef.current = null
      return
    }

    let isCancelled = false

    const loadThumbnails = async () => {
      setLoading(true)
      setError(null)
      setThumbnails(new Map())
      setFullImages(new Map())

      try {
        // Dynamic import to avoid SSR issues
        const pdfjsLib = await import('pdfjs-dist')
        pdfjsRef.current = pdfjsLib
        
        // Configure worker - use unpkg CDN which has all versions
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        
        // Store reference for on-demand high-res loading
        pdfDocRef.current = pdf

        const newThumbnails = new Map<number, string>()

        // Generate small thumbnails for grid view
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          if (isCancelled) break

          try {
            const page = await pdf.getPage(pageNum)
            // Small thumbnail (scale 0.5) for fast grid loading
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

  return { thumbnails, fullImages, loading, error, loadFullImage }
}
