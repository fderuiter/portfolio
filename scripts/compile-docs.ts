import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const docsDir = path.join(rootDir, "docs");
const caseStudyPath = path.join(docsDir, "CASE_STUDY.md");
const tempCaseStudyPath = path.join(rootDir, "tmp", "CASE_STUDY.md.bak");

// Save CASE_STUDY.md if present
let caseStudyContent: string | null = null;
if (fs.existsSync(caseStudyPath)) {
  caseStudyContent = fs.readFileSync(caseStudyPath, "utf8");
} else if (fs.existsSync(tempCaseStudyPath)) {
  caseStudyContent = fs.readFileSync(tempCaseStudyPath, "utf8");
}

// Clean docs directory except CASE_STUDY.md
if (fs.existsSync(docsDir)) {
  const entries = fs.readdirSync(docsDir);
  for (const entry of entries) {
    if (entry !== "CASE_STUDY.md") {
      fs.rmSync(path.join(docsDir, entry), { recursive: true, force: true });
    }
  }
} else {
  fs.mkdirSync(docsDir, { recursive: true });
}

// Restore CASE_STUDY.md before typedoc runs
if (caseStudyContent) {
  fs.writeFileSync(caseStudyPath, caseStudyContent, "utf8");
}

const typedocCmd = [
  "npx typedoc",
  '--entryPoints hooks --entryPoints types --entryPoints lib --exclude "**/env.d.ts"',
  "--entryPointStrategy expand",
  "--out docs",
  "--plugin typedoc-plugin-markdown",
  "--hideGenerator",
  "--cleanOutputDir false",
  "--gitRevision main",
  '--sourceLinkTemplate "https://github.com/fderuiter/portfolio/blob/{gitRevision}/{path}#L{line}"',
  "--intentionallyNotExported TypeMap --intentionallyNotExported GlobalOmitConfig --intentionallyNotExported TypeMapCb",
].join(" ");

try {
  execSync(typedocCmd, { stdio: "inherit", cwd: rootDir });
} finally {
  // Ensure CASE_STUDY.md is preserved after typedoc
  if (caseStudyContent && !fs.existsSync(caseStudyPath)) {
    fs.writeFileSync(caseStudyPath, caseStudyContent, "utf8");
  }
}
