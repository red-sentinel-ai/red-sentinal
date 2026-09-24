'use client'

import type React from 'react'
import { useState } from 'react'
import Image from 'next/image'
import { Upload, ImageIcon } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

interface ImagePickerSheetProps {
  open: boolean
  onClose: () => void
  onSelectImage: (img: { url: string; isCustom: boolean; file?: File | null }) => void
  title?: string
  subtitle?: string
  imageArray: string[]
  gifArray: string[]
  disableGifs?: boolean
}

export const ImagePickerSheet = ({
  open,
  onClose,
  onSelectImage,
  title = 'Select Sentinel Image',
  subtitle = 'Choose from our collection or upload your own',
  imageArray,
  gifArray,
  disableGifs = false,
}: ImagePickerSheetProps) => {
  const [selectedURL, setSelectedURL] = useState<string | null>(null)
  const [customFile, setCustomFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleCustomImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const previewURL = URL.createObjectURL(file)
      setCustomFile(file)
      setSelectedURL(previewURL)
      onSelectImage({ url: previewURL, isCustom: true, file })
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const previewURL = URL.createObjectURL(file)
      setCustomFile(file)
      setSelectedURL(previewURL)
      onSelectImage({ url: previewURL, isCustom: true, file })
    }
  }

  const handleImageClick = (url: string) => {
    setSelectedURL(url)
    setCustomFile(null)
    onSelectImage({ url, isCustom: false })
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto border-l border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] sm:w-[480px]"
      >
        <SheetHeader className="border-b border-[var(--color-border-subtle)] pb-6">
          <SheetTitle className="flex items-center gap-2 text-xl font-semibold text-[var(--color-text-primary)]">
            <ImageIcon className="h-5 w-5 text-[var(--color-text-secondary)]" />
            {title}
          </SheetTitle>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{subtitle}</p>
        </SheetHeader>

        <div className="p-4">
          <Tabs defaultValue="images" className="w-full">
            <TabsList className="mb-6 grid h-auto w-full grid-cols-3 gap-1 rounded-lg bg-[var(--color-bg-subtle)] p-1">
              <TabsTrigger
                value="gifs"
                disabled={disableGifs}
                className="group relative flex h-10 items-center justify-center gap-2 rounded-md border-0 bg-transparent px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 data-[state=active]:bg-[var(--color-bg-surface)] data-[state=active]:text-[var(--color-text-primary)] data-[state=active]:shadow-sm"
              >
                <span>GIFs</span>
              </TabsTrigger>

              <TabsTrigger
                value="images"
                className="group relative flex h-10 items-center justify-center gap-2 rounded-md border-0 bg-transparent px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] transition-all duration-300 data-[state=active]:bg-[var(--color-bg-surface)] data-[state=active]:text-[var(--color-text-primary)] data-[state=active]:shadow-sm"
              >
                <ImageIcon className="h-4 w-4" />
                <span>Images</span>
              </TabsTrigger>

              <TabsTrigger
                value="custom"
                className="group relative flex h-10 items-center justify-center gap-2 rounded-md border-0 bg-transparent px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] transition-all duration-300 data-[state=active]:bg-[var(--color-bg-surface)] data-[state=active]:text-[var(--color-text-primary)] data-[state=active]:shadow-sm"
              >
                <Upload className="h-4 w-4" />
                <span>Custom</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="gifs" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">Animated GIFs</h3>
                <span className="text-xs text-[var(--color-text-muted)]">{gifArray.length} available</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {gifArray.map((url, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'group relative cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-200 hover:shadow-md',
                      selectedURL === url
                        ? 'border-[var(--color-gold-primary)] shadow-lg'
                        : 'border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)]'
                    )}
                    onClick={() => handleImageClick(url)}
                  >
                    <Image
                      src={url || '/placeholder.svg'}
                      alt={`gif-${idx}`}
                      width={200}
                      height={150}
                      className="h-32 w-full object-cover"
                    />
                    {selectedURL === url && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-gold-primary)]/20">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-gold-primary)]">
                          <div className="h-2 w-2 rounded-full bg-[var(--color-text-on-gold)]" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="images" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">Static Images</h3>
                <span className="text-xs text-[var(--color-text-muted)]">{imageArray.length} available</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {imageArray.map((url, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'group relative cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-200 hover:shadow-md',
                      selectedURL === url
                        ? 'border-[var(--color-gold-primary)] shadow-lg'
                        : 'border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)]'
                    )}
                    onClick={() => handleImageClick(url)}
                  >
                    <Image
                      src={url || '/placeholder.svg'}
                      alt={`img-${idx}`}
                      width={200}
                      height={150}
                      className="h-32 w-full object-cover"
                    />
                    {selectedURL === url && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-gold-primary)]/20">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-gold-primary)]">
                          <div className="h-2 w-2 rounded-full bg-[var(--color-text-on-gold)]" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">Upload Custom Image</h3>
                <span className="text-xs text-[var(--color-text-muted)]">JPG, PNG, GIF</span>
              </div>

              <div
                className={cn(
                  'relative rounded-xl border-2 border-dashed p-8 transition-all duration-200',
                  dragActive
                    ? 'border-[var(--color-gold-primary)] bg-[var(--color-bg-subtle)]'
                    : 'border-[var(--color-border-default)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-subtle)]'
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCustomImage}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />

                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)]">
                    <Upload
                      className={cn(
                        'h-6 w-6 transition-colors',
                        dragActive ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'
                      )}
                    />
                  </div>

                  <div>
                    <p className="mb-1 text-sm font-medium text-[var(--color-text-primary)]">
                      {dragActive ? 'Drop your image here' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">Supports JPG, PNG, GIF up to 10MB</p>
                  </div>
                </div>
              </div>

              {customFile && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-[var(--color-text-secondary)]">Preview</h4>
                  <div className="relative overflow-hidden rounded-xl border-2 border-[var(--color-gold-primary)] shadow-lg">
                    <Image
                      src={URL.createObjectURL(customFile) || '/placeholder.svg'}
                      alt="custom preview"
                      width={400}
                      height={200}
                      className="h-48 w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-gold-primary)]/20">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-gold-primary)]">
                        <div className="h-2 w-2 rounded-full bg-[var(--color-text-on-gold)]" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-[var(--color-bg-subtle)] p-3 text-xs text-[var(--color-text-muted)]">
                    <span>{customFile.name}</span>
                    <span>{(customFile.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}
