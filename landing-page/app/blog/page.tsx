import Link from 'next/link'
import { getAllBlogPosts } from '@/lib/blogUtils'

export default function BlogIndex() {
  const allPosts = getAllBlogPosts()

  return (
    <div className="container mx-auto px-4 py-24 min-h-body min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl text-white md:text-5xl font-bold mb-8">Sui Sentinel Blog</h1>
        <p className="text-gray-400 text-lg mb-12">
          Latest insights, updates, and rewards for the Sui Sentinel community.
        </p>

        <div className="space-y-8">
          {allPosts.map((post) => (
            <Link
              href={`/blog/${post.slug}`}
              key={post.slug}
              passHref
            >
              <div className="block p-6 bg-gray-900 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors duration-200">
                <h2 className="text-2xl font-bold text-white mb-2">{post.title}</h2>
                <p className="text-gray-400 mb-4">{post.description}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium">{post.author}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(post.date).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
