import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getAllBlogPosts, getPostBySlug, BlogPost } from "@/lib/blogUtils";

export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

const getRelatedPosts = (
  currentPost: BlogPost,
  allPosts: BlogPost[]
): BlogPost[] => {
  const relatedPosts = allPosts.filter(
    (post) =>
      post.slug !== currentPost.slug &&
      post.tags.some((tag) => currentPost.tags.includes(tag))
  );
  return relatedPosts.slice(0, 3);
};

export default async function BlogPostPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;

  try {
    const allPosts = getAllBlogPosts();
    const post = getPostBySlug(slug);
    const relatedPosts = getRelatedPosts(post, allPosts);

    return (
      <div
        className="relative min-h-screen bg-white text-black bg-no-repeat"
        style={{
          backgroundImage: "url('/img/hero_bg.png')",
          backgroundSize: "100% auto",
        }}
      >
        <div className="vertical-line left-4"></div>
        <div className="vertical-line right-4"></div>

        <div className="relative z-10">
          <div
            className="min-h-[300px] md:min-h-[560px] bg-no-repeat bg-top h-full flex items-end pb-32 justify-center text-center bg-cover lg:bg-size-[100%_auto]"
            style={{
              backgroundImage: 'url("/img/bannerImage.png")',
            }}
          >
            <div className="text-white max-w-4xl mx-auto">
              <p className="text-xs font-black">{new Date(post.date).toLocaleDateString()}</p>
              <h1 className="text-2xl md:text-5xl font-bold">
                {post.title}
              </h1>
            </div>
          </div>
          <div className="max-w-4xl mx-auto my-12 px-4 md:px-8">
            <article className="prose prose-lg max-w-none prose-headings:font-medium prose-headings:text-black prose-p:text-[#5F5C5C] prose-p:leading-relaxed prose-li:text-[#5F5C5C] prose-strong:text-black prose-a:text-[#C871FF] hover:prose-a:text-purple-600">
              <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
            </article>

            {relatedPosts.length > 0 && (
              <>
                <div className="w-full h-px bg-black opacity-10 my-16"></div>
                <div>
                  <h2 className="text-3xl font-medium mb-8">Related Intel</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {relatedPosts.map((relatedPost) => (
                      <Link
                        href={`/blog/${relatedPost.slug}`}
                        key={relatedPost.slug}
                        className="group flex flex-col h-full bg-white border border-gray-200 hover:border-black transition-colors duration-300"
                      >
                        <div className="relative w-full h-48 overflow-hidden bg-gray-100">
                          <Image
                            src={relatedPost.image}
                            alt={relatedPost.title}
                            layout="fill"
                            objectFit="cover"
                            className="transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                          <h3 className="text-xl font-medium mb-3 group-hover:text-[#C871FF] transition-colors line-clamp-2">
                            {relatedPost.title}
                          </h3>
                          <p className="text-[#939393] text-sm line-clamp-2 mb-6">
                            {relatedPost.description}
                          </p>
                          <div className="mt-auto flex items-center text-sm font-bold text-black group-hover:gap-2 transition-all">
                            Read Article{" "}
                            <ArrowRight size={16} className="ml-2" />
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
      </div>
    );
  } catch (error) {
    console.log(error);
    notFound();
  }
}
