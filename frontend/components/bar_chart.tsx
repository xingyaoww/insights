"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { useState } from "react"
import { agents, AgentType, displayAgents } from "@/lib/agents"
import { Button } from "./ui/button"
import { useMediaPredicate } from "react-media-hook";

const chartConfig = Object.fromEntries(
    Object.entries(agents).map(([key, agent], i) => [
        key,
        { label: agent.name, color: `var(--chart-${i + 1})` },
    ])
) satisfies ChartConfig

const defaultShowAgents: AgentType[] = [AgentType.HUMAN, AgentType.CODEX, AgentType.JULES, AgentType.COPILOT];

export function AgentBarChart({ title, subtitle, chartData }: { title: string, subtitle: string, chartData: any }) {
    const [showAgents, setShowAgents] = useState(Object.fromEntries(
        displayAgents.map((k) => [k, defaultShowAgents.includes(k)])
    ));

    const isLargeScreen = useMediaPredicate("(min-width: 640px)");

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{subtitle}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="w-full aspect-[4/3] lg:aspect-[2/1]">
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="key"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value}
                        />

                        {isLargeScreen ? <YAxis axisLine={false} tickLine={false} tickMargin={8} /> : <></>}

                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

                        {displayAgents.map((k => {
                            if (showAgents[k]) {
                                return <Bar
                                    key={k}
                                    dataKey={k}
                                    type="monotone"
                                    fill={chartConfig[k].color}
                                    stroke="black"
                                    strokeWidth={0}
                                    isAnimationActive={false}
                                />
                            }
                        }))}
                    </BarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter>
                <div className="flex gap-2 my-4 flex-wrap items-center justify-center">
                    {displayAgents.map((k) => <Button key={k}
                        className="cursor-pointer h-[25px]"
                        style={{ backgroundColor: showAgents[k] ? chartConfig[k].color : "var(--muted-foreground)" }}
                        onClick={() => {
                            setShowAgents({ ...showAgents, [k]: !showAgents[k] })
                        }}>
                        {agents[k].name}
                    </Button>)}
                </div>
            </CardFooter>
        </Card>
    )
}
