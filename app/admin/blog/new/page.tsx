import type { Metadata } from "next";
import { PageLayout } from "@/components/PageLayout";
import { getAdminAuthSession } from "@/lib/auth/admin";
import { AdminAccessDenied } from "@/components/admin/AdminAccessDenied";
import { BlogAuthoringForm } from "@/components/admin/BlogAuthoringForm";

export const metadata: Metadata = {
  title: "New BlogPost | Admin Authoring",
  description: "Draft a new systems blog post.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function NewBlogPostPage() {
  const session = await getAdminAuthSession();

  if (!session.isAdmin) {
    return (
      <PageLayout variant="standard">
        <AdminAccessDenied
          userId={session.userId}
          primaryEmail={session.primaryEmail}
          displayName={session.displayName}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout variant="standard">
      <BlogAuthoringForm isNew={true} />
    </PageLayout>
  );
}
