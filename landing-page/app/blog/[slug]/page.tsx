import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { getAllBlogPosts, getPostBySlug } from '@/lib/blogUtils'

export async function generateStaticParams() {
  const posts = getAllBlogPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  try {
    const post = getPostBySlug(params.slug)

    return (
      <div className="container mx-auto px-4 py-24 min-h-body min-h-screen">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/blog"
            className="flex items-center gap-2 text-blue-500 hover:text-blue-400 transition-colors mb-8"
          >
            <ChevronLeft size={20} /> Back to all posts
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">{post.title}</h1>
          <div className="text-gray-400 text-sm mb-8 flex items-center gap-4">
            <p>By {post.author}</p>
            <span className="text-gray-600">•</span>
            <p>{new Date(post.date).toLocaleDateString()}</p>
          </div>

          <article className="prose prose-invert max-w-none text-gray-300">
            <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
          </article>
        </div>
      </div>
    )
  } catch (error) {
    notFound()
  }
}
