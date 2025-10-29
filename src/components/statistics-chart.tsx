
"use client"

import * as React from "react"
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ComposedChart } from "recharts"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"

type DailyStat = {
    date: string;
    wins: number;
    losses: number;
    accuracy: number;
};

type StatisticsChartProps = {
  data: DailyStat[];
}

export function StatisticsChart({ data }: StatisticsChartProps) {
  const chartConfig = {
      wins: {
        label: "Wins",
        color: "hsl(142.1 76.2% 41.2%)", // green-600
      },
      losses: {
        label: "Losses",
        color: "hsl(0 84.2% 60.2%)", // red-600
      },
      accuracy: {
        label: "Accuracy",
        color: "hsl(var(--primary))", // yellow-500
      }
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
        <ComposedChart
            data={data}
            margin={{
                top: 5,
                right: 20,
                left: -10,
                bottom: 5,
            }}
        >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis 
                dataKey="date" 
                tickLine={false}
                axisLine={false}
                tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
            />
            <YAxis
                yAxisId="left"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                tickFormatter={(value) => `${value}`}
            />
             <YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
                content={<ChartTooltipContent
                    labelClassName="font-bold"
                    nameKey="name"
                    formatter={(value, name) => (name === 'accuracy' ? `${value}%` : value)}
                 />}
            />
            <Legend />
            <Bar dataKey="wins" yAxisId="left" fill="var(--color-wins)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="losses" yAxisId="left" fill="var(--color-losses)" radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="accuracy" yAxisId="right" stroke="var(--color-accuracy)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        </ComposedChart>
    </ChartContainer>
  )
}

