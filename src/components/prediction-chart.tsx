"use client"

import * as React from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"

type PredictionChartProps = {
  data: { name: string; value: number; fill: string }[];
}

export function PredictionChart({ data }: PredictionChartProps) {
  const chartConfig = data.reduce((acc, item) => {
    acc[item.name] = { label: item.name };
    return acc;
  }, {} as any);

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          accessibilityLayer
          data={data}
          layout="vertical"
          margin={{
            left: 10,
            right: 10,
          }}
        >
          <YAxis
            dataKey="name"
            type="category"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
            width={80}
          />
          <XAxis 
            dataKey="value" 
            type="number" 
            hide 
          />
          <Tooltip 
            cursor={{ fill: 'hsl(var(--muted))' }}
            content={<ChartTooltipContent 
                formatter={(value) => `${value}%`} 
                labelClassName="font-bold"
            />}
          />
          <Bar dataKey="value" radius={5} barSize={32}>
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
