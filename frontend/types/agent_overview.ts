export interface AgentOverview {
  total_prs: number;
  closed_prs: number;
  merged_prs: number;
  additions: number;
  deletions: number;
  files_changed: number;
  first_seen: Date;
}