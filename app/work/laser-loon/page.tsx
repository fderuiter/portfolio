import CaseStudyPage, { generateMetadata as generateCSMetadata } from "@/app/case-studies/[slug]/page";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const baseMeta = await generateCSMetadata({
    params: Promise.resolve({ slug: "laser-loon" }),
  });

  return {
    ...baseMeta,
    title: "The Laser Loon: Graphic Design Case Study & Open Asset Repository",
    description:
      "Comprehensive graphic design case study and open vector asset distribution hub for the Laser Loon (MN Flag Submission F277). Download source .ai, .eps, .pdf, .svg, .psd, .png, and .jpg master files.",
    alternates: {
      canonical: "/work/laser-loon",
    },
    openGraph: {
      ...baseMeta.openGraph,
      title: "The Laser Loon: Graphic Design Case Study & Open Asset Repository",
      description:
        "Comprehensive graphic design case study and open vector asset distribution hub for the Laser Loon (MN Flag Submission F277). Download source .ai, .eps, .pdf, .svg, .psd, .png, and .jpg master files.",
      url: "/work/laser-loon",
    },
  };
}

export default async function LaserLoonWorkPage() {
  return <CaseStudyPage params={Promise.resolve({ slug: "laser-loon" })} />;
}
