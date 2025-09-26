'use client'

import type React from 'react'

import { useState } from 'react'
import Image from 'next/image'
import { Upload, ImageIcon } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { SENTINEL_GIFS, SENTINEL_IMAGES } from '@/constants'
import { cn } from '@/lib/utils'

interface ImagePickerSheetProps {
  open: boolean
  onClose: () => void
  onSelectImage: (img: { url: string; isCustom: boolean; file?: File | null }) => void
  title?: string
  subtitle?: string
}

export const ImagePickerSheet = ({
  open,
  onClose,
  onSelectImage,
  title = 'Select Sentinel Image',
  subtitle = 'Choose from our collection or upload your own',
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
    <Sheet
      open={open}
      onOpenChange={onClose}
    >
      <SheetContent
        side="right"
        className="w-full sm:w-[480px] bg-[#0A0A0A] border-l border-[#1A1A1A] text-white overflow-y-auto"
      >
        <SheetHeader className="pb-6 border-b border-[#1A1A1A]">
          <SheetTitle className="text-white text-xl font-semibold flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            {title}
          </SheetTitle>
          <p className="text-gray-400 text-sm mt-1">{subtitle}</p>
        </SheetHeader>

        <div className="px-4">
          <Tabs
            defaultValue="gifs"
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-3 bg-transparent border-0 p-0 h-auto gap-2 mb-6">
              <TabsTrigger
                value="gifs"
                className="group relative flex flex-col sm:flex-row items-center justify-center gap-2 h-16 sm:h-12 px-4 py-3 bg-[#111111] border border-[#2A2A2A] rounded-xl transition-all duration-300 hover:bg-[#1A1A1A] hover:border-[#3A3A3A] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1D9BF0]/20 data-[state=active]:to-[#1D9BF0]/10 data-[state=active]:border-[#1D9BF0] data-[state=active]:shadow-[0_0_20px_rgba(29,155,240,0.2)] text-gray-400 data-[state=active]:text-white font-medium"
              >
                <span className="text-xs sm:text-sm font-medium">GIFs</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#1D9BF0]/0 to-[#1D9BF0]/0 group-data-[state=active]:from-[#1D9BF0]/5 group-data-[state=active]:to-[#1D9BF0]/0 transition-all duration-300" />
              </TabsTrigger>

              <TabsTrigger
                value="images"
                className="group relative flex flex-col sm:flex-row items-center justify-center gap-2 h-16 sm:h-12 px-4 py-3 bg-[#111111] border border-[#2A2A2A] rounded-xl transition-all duration-300 hover:bg-[#1A1A1A] hover:border-[#3A3A3A] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1D9BF0]/20 data-[state=active]:to-[#1D9BF0]/10 data-[state=active]:border-[#1D9BF0] data-[state=active]:shadow-[0_0_20px_rgba(29,155,240,0.2)] text-gray-400 data-[state=active]:text-white font-medium"
              >
                <ImageIcon className="w-5 h-5 transition-all duration-300 data-[state=active]:text-[#1D9BF0]" />
                <span className="text-xs sm:text-sm font-medium">Images</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#1D9BF0]/0 to-[#1D9BF0]/0 group-data-[state=active]:from-[#1D9BF0]/5 group-data-[state=active]:to-[#1D9BF0]/0 transition-all duration-300" />
              </TabsTrigger>

              <TabsTrigger
                value="custom"
                className="group relative flex flex-col sm:flex-row items-center justify-center gap-2 h-16 sm:h-12 px-4 py-3 bg-[#111111] border border-[#2A2A2A] rounded-xl transition-all duration-300 hover:bg-[#1A1A1A] hover:border-[#3A3A3A] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1D9BF0]/20 data-[state=active]:to-[#1D9BF0]/10 data-[state=active]:border-[#1D9BF0] data-[state=active]:shadow-[0_0_20px_rgba(29,155,240,0.2)] text-gray-400 data-[state=active]:text-white font-medium"
              >
                <Upload className="w-5 h-5 transition-all duration-300 data-[state=active]:text-[#1D9BF0]" />
                <span className="text-xs sm:text-sm font-medium">Custom</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#1D9BF0]/0 to-[#1D9BF0]/0 group-data-[state=active]:from-[#1D9BF0]/5 group-data-[state=active]:to-[#1D9BF0]/0 transition-all duration-300" />
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="gifs"
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-300">Animated GIFs</h3>
                <span className="text-xs text-gray-500">{SENTINEL_GIFS.length} available</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {SENTINEL_GIFS.map((url, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'group relative border-2 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg',
                      selectedURL === url
                        ? 'border-[#1D9BF0] shadow-[0_0_20px_rgba(29,155,240,0.3)]'
                        : 'border-[#2A2A2A] hover:border-[#3A3A3A]'
                    )}
                    onClick={() => handleImageClick(url)}
                  >
                    <Image
                      src={url || '/placeholder.svg'}
                      alt={`gif-${idx}`}
                      width={200}
                      height={150}
                      className="w-full h-32 object-cover"
                    />
                    {selectedURL === url && (
                      <div className="absolute inset-0 bg-[#1D9BF0]/20 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-[#1D9BF0] flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent
              value="images"
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-300">Static Images</h3>
                <span className="text-xs text-gray-500">{SENTINEL_IMAGES.length} available</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {SENTINEL_IMAGES.map((url, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'group relative border-2 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg',
                      selectedURL === url
                        ? 'border-[#1D9BF0] shadow-[0_0_20px_rgba(29,155,240,0.3)]'
                        : 'border-[#2A2A2A] hover:border-[#3A3A3A]'
                    )}
                    onClick={() => handleImageClick(url)}
                  >
                    <Image
                      src={url || '/placeholder.svg'}
                      alt={`img-${idx}`}
                      width={200}
                      height={150}
                      className="w-full h-32 object-cover"
                    />
                    {selectedURL === url && (
                      <div className="absolute inset-0 bg-[#1D9BF0]/20 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-[#1D9BF0] flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent
              value="custom"
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-300">Upload Custom Image</h3>
                <span className="text-xs text-gray-500">JPG, PNG, GIF</span>
              </div>

              <div
                className={cn(
                  'relative border-2 border-dashed rounded-xl p-8 transition-all duration-200',
                  dragActive
                    ? 'border-[#1D9BF0] bg-[#1D9BF0]/5'
                    : 'border-[#2A2A2A] hover:border-[#3A3A3A] hover:bg-[#111111]'
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
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="text-center space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-[#1A1A1A] flex items-center justify-center">
                    <Upload
                      className={cn(
                        'w-6 h-6 transition-colors',
                        dragActive ? 'text-[#1D9BF0]' : 'text-gray-400'
                      )}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-white mb-1">
                      {dragActive ? 'Drop your image here' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-gray-500">Supports JPG, PNG, GIF up to 10MB</p>
                  </div>
                </div>
              </div>

              {customFile && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-300">Preview</h4>
                  <div className="relative border-2 border-[#1D9BF0] rounded-xl overflow-hidden shadow-[0_0_20px_rgba(29,155,240,0.3)]">
                    <Image
                      src={URL.createObjectURL(customFile) || '/placeholder.svg'}
                      alt="custom preview"
                      width={400}
                      height={200}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-[#1D9BF0]/20 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-[#1D9BF0] flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400 bg-[#111111] rounded-lg p-3">
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
