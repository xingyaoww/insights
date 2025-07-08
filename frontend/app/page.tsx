import { AgentInsightChart } from "@/components/insight_chart";
import { getBinnedInsight } from "@/lib/db";
import { Metadata } from "next";
import Link from "next/link";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { OverviewTable } from "@/components/overview_table";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Agents in the Wild",
  description:
    "We track and analyze the performance of autonomous code agents in the wild (on GitHub).",
};

async function ConclusionCard({ children }: { children: ReactNode }) {
  return (
    <Card className="mt-4 p-4 bg-amber-50 dark:bg-amber-950">
      {children}
    </Card>
  );
}

// Prevent prerendering
export const dynamic = "force-dynamic";

async function InsightSection({
  title,
  description = "",
  insightName,
  xLabel,
  chartType = "line",
}: {
  title: string;
  description?: string;
  insightName: string;
  xLabel: string;
  chartType?: "line" | "bar";
}) {
  return (
    <Tabs defaultValue="num-prs">
      <div className="flex items-start flex-col md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-medium my-4">{title}</h2>
        <TabsList>
          <TabsTrigger value="num-prs" className="cursor-pointer">
            Portion of PRs
          </TabsTrigger>
          <TabsTrigger value="merge-rate" className="cursor-pointer">
            Merge Rate
          </TabsTrigger>
        </TabsList>
      </div>

      {description.length > 0 && (
        <p className="text-gray-600 mt-2 mb-4">{description}</p>
      )}

      <TabsContent value="num-prs">
        <AgentInsightChart
          title="Portion of PRs"
          subtitle="The percentage of PRs in each bucket."
          insight={await getBinnedInsight(insightName, "bin", "total_pr_share", "min")}
          xLabel={xLabel}
          chartType={chartType}
        />
      </TabsContent>
      <TabsContent value="merge-rate">
        <AgentInsightChart
          title="Merge Rate"
          subtitle="The merge rate inside each bucket."
          insight={await getBinnedInsight(insightName, "bin", "merge_rate", "min", true)}
          bounds={true}
          xLabel={xLabel}
          chartType={chartType}
        />
      </TabsContent>
    </Tabs>
  );
}

export default async function Home() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="my-8 flex items-center gap-[30px] flex-col md:flex-row">
        <div className="flex-shrink-0">
          <Image src="/aitw-logo.png" alt="AITW Logo" width={771} height={939} className="h-[140px] w-auto" />
        </div>
        <div className="text-center md:text-left flex flex-col items-center md:items-start">
          <h1 className="text-3xl font-medium w-full mb-4">Agents in the Wild</h1>
          <h3 className="w-full font-medium text-gray-500">
            We track and analyze the activity and performance of autonomous code agents in the wild (on GitHub).
          </h3>
          <div className="flex items-center gap-[20px] mt-5">
            <Image src="/logos.svg" alt="Logicstar Logo" width={654} height={337} className="h-[20px] w-auto dark:invert" />
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-medium mt-12 mb-4">📊 Overview</h2>
      <p className="my-4">
        We have been tracking all pull requests created since <strong>2025-05-15</strong>.
        Our pull request database is updated hourly, capturing all newly created and closed pull requests since the last update.
        The table below provides an initial overview of the agents we track and their activity.
        Detailed breakdowns by specific PR attributes are presented in the following charts.
        More information on how we scrape, identify, and analyze this activity can be found at the bottom of the page or on our <Link href="https://github.com/logic-star-ai/insights" className="text-blue-600" target="_blank">GitHub</Link>.
      </p>
      <OverviewTable />
      <div className="bg-amber-100 dark:bg-amber-950 border-l-4 border-amber-200 dark:border-amber-900 p-4 my-4 text-sm">
        ℹ️ We calculate <strong>Merge Rate = Merged / Closed</strong>. Other trackers use Merged / Total, but we believe open PRs shouldn&apos;t count—they are either still under review or forgotten, neither of which indicates success or failure.
      </div>
      <div className="bg-amber-100 dark:bg-amber-950 border-l-4 border-amber-200 dark:border-amber-900 p-4 my-4 text-sm">
        ℹ️ Different merge rates are heavily influenced by the level of human approval involved in the loop. For example, GitHub Copilot opens draft PRs without any prior approval, whereas OpenAI Codex only creates a PR after receiving human approval. Therefore, one should be very cautious when using merge rates as an indicator of agent quality.
      </div>

      <hr className="my-8" />

      <Tabs defaultValue="num-prs">
        <div className="flex items-start flex-col md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-medium my-4">📈 Daily Trends</h2>
          <TabsList>
            <TabsTrigger value="num-prs" className="cursor-pointer">
              Number of PRs
            </TabsTrigger>
            <TabsTrigger value="merge-rate" className="cursor-pointer">
              Merge Rate
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="num-prs">
          <AgentInsightChart
            title="Number of PRs"
            subtitle="Number of PRs created on each day."
            insight={await getBinnedInsight("insight_daily", "bin", "total_prs", "bin::date")}
          />
        </TabsContent>
        <TabsContent value="merge-rate">
          <AgentInsightChart
            title="Merge Rate"
            subtitle="Merge rate for PRs created on each day."
            insight={await getBinnedInsight("insight_daily", "bin", "merge_rate", "bin::date", true)}
            bounds={true}
          />
        </TabsContent>
      </Tabs>

      <ConclusionCard>
        💡 Agents (primarily OpenAI Codex) contribute a significant volume, currently accounting for around 5–10% of public PRs. Merge rates vary significantly between agents, but this shouldn&apos;t be interpreted as a direct measure of agent quality, as the level of human input differs considerably.
      </ConclusionCard>

      <hr className="my-8" />

      <InsightSection
        title="⭐ Repo Popularity"
        description="We measure repo popularity by the number of stars the base repository of the PR has."
        insightName="insight_repo_popularity"
        xLabel="Number of repository stars"
      />
      <ConclusionCard>
        💡 OpenAI Codex, which generates the most volume, seems to be primarily used on low-star (≤ 10 stars) repositories. This isn&apos;t generally true for all agents. Agent merge rates tend to drop significantly for more popular repositories, whereas human PRs tend to have more stable merge rates.
      </ConclusionCard>

      <hr className="my-8" />

      <InsightSection
        title="📐 Change Complexity"
        description="As a proxy for change complexity, we use the number of additions and deletions made in the PR. Each addition or deletion refers to one line."
        insightName="insight_change_complexity"
        xLabel="Number of additions + deletions"
      />

      <hr className="my-8" />

      <InsightSection
        title="📂 Files Changed"
        insightName="insight_changed_files"
        xLabel="Number of files changed"
      />
      <ConclusionCard>
        💡 Merge rates tend to decline slightly as more files are modified. Agents are not afraid of editing multiple files.
      </ConclusionCard>

      <hr className="my-8" />

      <InsightSection
        title="± Additions/Deletions"
        description="Here we analyze the ratio between additions and deletions. We define AD = additions / (additions + deletions). A high AD suggests a lot of new code, while an AD around 0.5 indicates refactoring. An AD close to zero means a lot of code was deleted and very little was added."
        insightName="insight_ad_ratio"
        xLabel="AD ratio"
      />
      <ConclusionCard>
        💡 Agents tend to add more code than they delete (potentially adding features), while humans are more likely to refactor. Merge rates remain stable across cleanup, refactoring, and additions.
      </ConclusionCard>

      <hr className="my-8" />

      <InsightSection
        title="🔣 Repository Language"
        description="Here we analyze the primary language of the base repository. GitHub assigns each repository one primary language that makes up most of the code in the repository."
        insightName="insight_language"
        xLabel="Repository Language"
        chartType="bar"
      />

      <hr className="my-8" />

      <InsightSection
        title="🔣 Change Language"
        description="Here we analyze the primary language of the change. Since GitHub does not provide this, we determine the primary language by the file extensions of changed files. We associate each file extension with a language and determine the most changed language. Certain filenames (e.g., package-lock.json, *.lock) are excluded."
        insightName="insight_change_language"
        xLabel="Change Language"
        chartType="bar"
      />

      <hr className="my-8" />

      <h2 className="text-2xl font-medium my-4">📦 Data</h2>
      <p>
        We track all opened and closed GitHub pull requests through the{" "}
        <Link href="https://docs.github.com/en/rest?apiVersion=2022-11-28" className="text-blue-600">
          GitHub API
        </Link>, and analyze each pull request to determine if it was authored by an autonomous code agent.
      </p>
      <p className="my-4">To classify each pull request, we use the following rules:</p>
      <ul className="list-disc pl-8 my-1">
        <li><strong>Human</strong>: All PRs that do not match any known agent pattern and are authored by a User account.</li>
        <li><strong>Bot</strong>: All PRs that do not match any known agent pattern and are authored by a Bot account.</li>
        <li><strong>OpenAI Codex</strong>: PRs where the head branch starts with <i>codex/</i>.</li>
        <li><strong>Google Jules</strong>: PRs where the first commit is authored by <i>google-labs-jules[bot]</i>.</li>
        <li><strong>GitHub Copilot</strong>: PRs where the head branch starts with <i>copilot/</i>.</li>
        <li><strong>Devin</strong>: PRs authored by user <i>devin-ai-integration[bot]</i>.</li>
        <li><strong>Cursor Agent</strong>: PRs where the head branch starts with <i>cursor/</i>.</li>
      </ul>

      <hr className="my-8" />

      <h2 className="text-2xl font-medium my-4">✨ Ideas?</h2>
      <p>
        Whether you have ideas for new autonomous agents, additional insights, or anything else,
        please create an issue on our{" "}
        <Link href="https://github.com/logic-star-ai/insights" className="text-blue-600" target="_blank">
          GitHub repository
        </Link> or email{" "}
        <Link href="mailto:insights@logicstar.ai" className="text-blue-600">
          insights@logicstar.ai
        </Link>.
      </p>

      <hr className="my-8" />

      <h2 className="text-2xl font-medium my-4">🌎 Open Source</h2>
      <p>
        The source code and documentation explaining how we scrape data, identify agents, and more can be found on our{" "}
        <Link href="https://github.com/logic-star-ai/insights" className="text-blue-600" target="_blank">
          GitHub repository
        </Link>. Like the project? Give it a star!
      </p>

      <footer className="text-gray-500 text-center py-6 mt-8">
        A project by LogicStar AI and the Secure, Reliable, and Intelligent Systems Lab at ETH Zürich.
      </footer>
    </main>
  );
}