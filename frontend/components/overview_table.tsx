import { agents, AgentType, displayAgents } from "@/lib/agents";
import { getOverview } from "@/lib/db";
import { AgentOverview } from "@/types/agent_overview";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

export async function OverviewTable() {
  const data = await getOverview();
  const rows: [AgentType, AgentOverview][] = Object.entries(data)
    .filter(([k,]) => displayAgents.includes(k as AgentType))
    .map(([k, v]) => [k as AgentType, v])
  rows.sort(([, v1], [, v2]) => v2.total_prs - v1.total_prs);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Agent</TableHead>
            <TableHead>PRs Opened</TableHead>
            <TableHead>PRs Closed</TableHead>
            <TableHead>PRs Merged</TableHead>
            <TableHead>Merge Rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(([agent, overview]) => {
            return (
              <TableRow key={agents[agent].name}>
                <TableCell>
                  <div className="flex gap-[10px] font-medium items-center">
                    {!!agents[agent]?.logo ? (
                      <img
                        src={agents[agent].logo}
                        alt={agents[agent].name}
                        className={`h-[18px] w-[18px] ${agents[agent].logo_invert ? 'dark:invert' : ''}`}
                      />
                    ) : null}
                    {agents[agent].name}
                  </div>
                </TableCell>
                <TableCell>{overview.total_prs || 0}</TableCell>
                <TableCell>{overview.closed_prs || 0}</TableCell>
                <TableCell>{overview.merged_prs || 0}</TableCell>
                <TableCell>
                  {(overview.closed_prs || 0) == 0 ? '-' : ((overview.merged_prs || 0) / overview.closed_prs * 100).toFixed(2)} %
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  );
}
