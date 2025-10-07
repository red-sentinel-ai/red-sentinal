import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ArrowRight } from 'lucide-react'
import { getAllBlogPosts, getPostBySlug, BlogPost } from '@/lib/blogUtils'

export async function generateStaticParams() {
  const posts = getAllBlogPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

const getRelatedPosts = (currentPost: BlogPost, allPosts: BlogPost[]): BlogPost[] => {
  const relatedPosts = allPosts.filter(
    (post) =>
      post.slug !== currentPost.slug && post.tags.some((tag) => currentPost.tags.includes(tag))
  )
  return relatedPosts.slice(0, 3)
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  try {
    const allPosts = getAllBlogPosts()
    const post = getPostBySlug(params.slug)
    const relatedPosts = getRelatedPosts(post, allPosts)

    return (
      <div className="container mx-auto px-4 py-24 min-h-body">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/blog"
            className="flex items-center gap-2 text-blue-500 hover:text-blue-400 transition-colors mb-8"
          >
            <ChevronLeft size={20} /> Back to all posts
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>

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

          <div className="text-gray-400 text-sm mb-8 flex items-center gap-4">
            <p>By {post.author}</p>
            <span className="text-gray-600">•</span>
            <p>{new Date(post.date).toLocaleDateString()}</p>
          </div>

          <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-8">
            <Image
              src={post.image}
              alt={post.title}
              layout="fill"
              objectFit="cover"
            />
          </div>

          <article className="prose prose-invert max-w-none text-gray-300">
            <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
          </article>

          {relatedPosts.length > 0 && (
            <>
              <hr className="my-12 border-gray-800" />
              <div className="mt-12">
                <h2 className="text-3xl font-bold mb-6">Related Blogs</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Link
                      href={`/blog/${relatedPost.slug}`}
                      key={relatedPost.slug}
                      passHref
                    >
                      <div className="group block p-4 bg-gray-900 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors duration-200">
                        <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                          {relatedPost.title}
                        </h3>
                        <p className="text-gray-400 text-sm line-clamp-3">
                          {relatedPost.description}
                        </p>
                        <div className="mt-4 text-blue-500 flex items-center gap-2">
                          Read More <ArrowRight size={16} />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    )
  } catch (error) {
    notFound()
  }
}
