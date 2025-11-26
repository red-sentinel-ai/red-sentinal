import Link from 'next/link'
import Image from 'next/image'
import { getAllBlogPosts } from '@/lib/blogUtils'
import { ArrowRight } from 'lucide-react'

export default function BlogIndex() {
  const allPosts = getAllBlogPosts()

  return (
    <div
      className="relative min-h-screen bg-white text-black bg-no-repeat"
      style={{
        backgroundImage: "url('/img/hero_bg.png')",
        backgroundSize: '100% auto',
      }}
    >
      <div className="vertical-line left-4 -top-40"></div>
      <div className="vertical-line right-4 -top-40"></div>

      <div
        style={{
          backgroundImage: "url('/img/bannerImage.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        className="w-full h-[300px] md:h-[500px] flex items-end justify-center pb-16 mb-12"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-white tracking-wide">Sui Sentinel</h1>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pb-24">
        <div className="mb-16 md:pl-4 text-center md:text-left">
          <p className="text-xl text-[#5F5C5C] max-w-2xl leading-relaxed mx-auto md:mx-0">
            Deep dives into AI security, platform updates, and strategies from the battlefield. Real
            voices from the guardians protecting the network.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allPosts.map((post) => (
            <Link
              href={`/blog/${post.slug}`}
              key={post.slug}
              className="group flex flex-col h-full bg-white border border-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300"
            >
              <div className="relative w-full aspect-video overflow-hidden border-b border-black">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500"
                />
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-medium px-2 py-1 bg-gray-100 border border-gray-200 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h2 className="text-2xl font-medium mb-3 leading-snug transition-colors">
                  {post.title}
                </h2>

                <p className="text-[#5F5C5C] text-sm mb-6 line-clamp-3 flex-1 leading-relaxed">
                  {post.description}
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-black">{post.author}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(post.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="size-8 rounded-full border border-black flex items-center justify-center transition-colors">
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
