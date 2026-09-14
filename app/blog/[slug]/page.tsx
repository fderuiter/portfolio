import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllPublishedBlogPosts, getBlogPostBySlug } from "@/lib/blog";
import { RichNarrative } from "@/components/RichNarrative";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { NextPrevNav } from "@/components/ui/NextPrevNav";
import { PageLayout } from "@/components/PageLayout";
import { resolveBaseUrl } from "@/lib/domain";
import { getBreadcrumbSchema } from "@/lib/seo";

export const revalidate = 3600;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getAllPublishedBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Dispatch Not Found",
      description: "The requested blog post was not found.",
    };
  }

  const ogImageUrl = `${resolveBaseUrl()}/blog/${slug}/opengraph-image`;

  return {
    title: `${post.title} | Blog`,
    description: post.dek,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title: `${post.title} | Blog`,
      description: post.dek,
      type: "article",
      url: `${resolveBaseUrl()}/blog/${slug}`,
      publishedTime: post.publishedAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      tags: post.tags,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${post.title} | Blog`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | Blog`,
      description: post.dek,
      images: [ogImageUrl],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  const [allPosts, post] = await Promise.all([
    getAllPublishedBlogPosts(),
    getBlogPostBySlug(slug),
  ]);

  if (!post) {
    notFound();
  }

  const currentIndex = allPosts.findIndex((p) => p.slug === slug);
  const prevPost =
    currentIndex > 0
      ? allPosts[currentIndex - 1]
      : allPosts[allPosts.length - 1];
  const nextPost =
    currentIndex < allPosts.length - 1
      ? allPosts[currentIndex + 1]
      : allPosts[0];

  return (
    <PageLayout
      variant="standard"
      className="py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-zinc-950 text-foreground flex flex-col items-center relative overflow-hidden outline-none"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: getBreadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Blog", url: "/blog" },
            { name: post.title, url: `/blog/${post.slug}` },
          ]),
        }}
      />
      {/* Background Blurs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-brand-cyan/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-80 h-80 rounded-full bg-brand-blue/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-3xl">
        {/* Breadcrumbs Navigation */}
        <div className="mb-8">
          <Breadcrumbs
            items={[{ label: "Blog", href: "/blog" }, { label: post.title }]}
          />
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-neutral-100 mb-4 leading-tight">
          {post.title}
        </h1>

        <p className="text-lg text-muted-strong font-medium mb-8">{post.dek}</p>

        {/* Tags list row */}
        <div className="flex flex-wrap gap-2 pb-8 border-b border-zinc-900">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-0.5 text-xs font-mono font-medium bg-zinc-900/60 border border-zinc-800/80 text-muted-strong rounded"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Long-form Article Narrative */}
        <article className="prose prose-invert max-w-none text-neutral-300 leading-relaxed space-y-8 mt-8">
          <RichNarrative html={post.body} />
        </article>

        {/* Sequential Next / Previous Dispatch Navigation */}
        {prevPost && nextPost && (
          <NextPrevNav
            prev={
              prevPost.slug !== slug
                ? {
                    title: prevPost.title,
                    href: `/blog/${prevPost.slug}`,
                    label: "Previous Dispatch",
                    tag: prevPost.pillar,
                  }
                : null
            }
            next={
              nextPost.slug !== slug
                ? {
                    title: nextPost.title,
                    href: `/blog/${nextPost.slug}`,
                    label: "Next Dispatch",
                    tag: nextPost.pillar,
                  }
                : null
            }
            backToHub={{
              title: "View All Dispatches",
              href: "/blog",
            }}
          />
        )}
      </div>
    </PageLayout>
  );
}
