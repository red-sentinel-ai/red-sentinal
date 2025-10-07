import Link from 'next/link'
import Image from 'next/image'
import { getAllBlogPosts } from '@/lib/blogUtils'

export default function BlogIndex() {
  const allPosts = getAllBlogPosts()

  return (
    <div className="container mx-auto px-4 py-24 min-h-body min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl text-white md:text-5xl font-bold mb-4">Sui Sentinel Blog</h1>
        <p className="text-gray-400 text-lg mb-12">
          Latest insights, updates, and rewards for the Sui Sentinel community.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {allPosts.map((post) => (
            <Link
              href={`/blog/${post.slug}`}
              key={post.slug}
              passHref
            >
              <div className="group block h-full bg-gray-900 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors duration-200 overflow-hidden">
                <div className="relative w-full h-48 overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">{post.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="font-medium">{post.author}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(post.date).toLocaleDateString()}</span>
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
