export interface BaseCaseStudy {
  id: string;
  slug: string;
  title: string;
  primary_language: string;
  github_url?: string | null;
  editorial_content: string;       // general summaries
  architectural_narrative: string; // deep-technical breakdowns
  published: boolean;
  simulated_telemetry: boolean;
  tags: string;                    // comma-separated list of tags
  created_at: Date;
  updated_at: Date;
}

// CDISC ODM & SDTM Specialized Case Study Structure
export interface ClinicalDataCaseStudy extends BaseCaseStudy {
  standards_validated: ("CDISC_ODM" | "CDISC_SDTM")[];
  parsing_mechanisms: "SAX_STREAMING" | "DOM_PARSING";
  regulatory_targets: ("FDA" | "PMDA" | "EMA")[];
}

// GitHub API Cached Statistics Payload
export interface GitHubRepoStats {
  stars: number;
  forks: number;
  openIssues: number;
  watchers: number;
  languages: Record<string, number>; // language name -> byte count
}

// GitHub API Cache Commit Details
export interface GitHubCommit {
  sha: string;
  message: string;
  date: string;
  author: string;
  url: string;
}

// GitHub API Cached Commit History Payload
export interface GitHubCommitHistory {
  commits: GitHubCommit[];
  totalCommits: number;
  lastUpdated: string;
}
