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
    <Sheet
      open={open}
      onOpenChange={onClose}
    >
      <SheetContent
        side="right"
        className="w-full sm:w-[480px] bg-white border-l border-gray-200 text-black overflow-y-auto"
      >
        <SheetHeader className="pb-6 border-b border-gray-200">
          <SheetTitle className="text-black text-xl font-semibold flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-gray-700" />
            {title}
          </SheetTitle>
          <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
        </SheetHeader>

        <div className="p-4">
          <Tabs
            defaultValue="images"
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-3 bg-gray-100 p-1 rounded-lg h-auto gap-1 mb-6">
              <TabsTrigger
                value="gifs"
                disabled={disableGifs}
                className="group relative flex items-center justify-center gap-2 h-10 px-4 py-2 bg-transparent border-0 rounded-md transition-all duration-300 data-[state=active]:bg-white data-[state=active]:shadow-sm text-gray-500 data-[state=active]:text-black font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <span>GIFs</span>
              </TabsTrigger>

              <TabsTrigger
                value="images"
                className="group relative flex items-center justify-center gap-2 h-10 px-4 py-2 bg-transparent border-0 rounded-md transition-all duration-300 data-[state=active]:bg-white data-[state=active]:shadow-sm text-gray-500 data-[state=active]:text-black font-medium text-sm"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Images</span>
              </TabsTrigger>

              <TabsTrigger
                value="custom"
                className="group relative flex items-center justify-center gap-2 h-10 px-4 py-2 bg-transparent border-0 rounded-md transition-all duration-300 data-[state=active]:bg-white data-[state=active]:shadow-sm text-gray-500 data-[state=active]:text-black font-medium text-sm"
              >
                <Upload className="w-4 h-4" />
                <span>Custom</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="gifs"
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">Animated GIFs</h3>
                <span className="text-xs text-gray-500">{gifArray.length} available</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {gifArray.map((url, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'group relative border-2 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md',
                      selectedURL === url
                        ? 'border-black shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
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
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
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
                <h3 className="text-sm font-medium text-gray-700">Static Images</h3>
                <span className="text-xs text-gray-500">{imageArray.length} available</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {imageArray.map((url, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'group relative border-2 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md',
                      selectedURL === url
                        ? 'border-black shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
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
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
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
                <h3 className="text-sm font-medium text-gray-700">Upload Custom Image</h3>
                <span className="text-xs text-gray-500">JPG, PNG, GIF</span>
              </div>

              <div
                className={cn(
                  'relative border-2 border-dashed rounded-xl p-8 transition-all duration-200',
                  dragActive
                    ? 'border-black bg-gray-100'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
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
                  <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                    <Upload
                      className={cn(
                        'w-6 h-6 transition-colors',
                        dragActive ? 'text-black' : 'text-gray-500'
                      )}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-black mb-1">
                      {dragActive ? 'Drop your image here' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-gray-500">Supports JPG, PNG, GIF up to 10MB</p>
                  </div>
                </div>
              </div>

              {customFile && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Preview</h4>
                  <div className="relative border-2 border-black rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src={URL.createObjectURL(customFile) || '/placeholder.svg'}
                      alt="custom preview"
                      width={400}
                      height={200}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-100 rounded-lg p-3">
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
