import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

export interface BlogMetadata {
  title: string
  date: string
  description: string
  author: string
}

export interface BlogPost extends BlogMetadata {
  slug: string
  contentHtml: string
}

const blogsDirectory = path.join(process.cwd(), 'blogs')

export function getAllBlogPosts(): BlogPost[] {
  const fileNames = fs.readdirSync(blogsDirectory)
  const allPostsData = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, '')
    const fullPath = path.join(blogsDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const matterResult = matter(fileContents)

    const contentHtml = remark().use(html).processSync(matterResult.content).toString()

    return {
      slug,
      contentHtml,
      ...(matterResult.data as BlogMetadata),
    }
  })

  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1
    } else {
      return -1
    }
  })
}

export function getPostBySlug(slug: string): BlogPost {
  const fullPath = path.join(blogsDirectory, `${slug}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const matterResult = matter(fileContents)
  const contentHtml = remark().use(html).processSync(matterResult.content).toString()

  return {
    slug,
    contentHtml,
    ...(matterResult.data as BlogMetadata),
  }
}
