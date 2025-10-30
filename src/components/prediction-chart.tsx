"use client"

import * as React from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, LabelList } from "recharts"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"

type PredictionChartProps = {
  data: { name: string; value: number; fill: string }[];
}

const CustomYAxisTick = (props: any) => {
    const { y, payload, index, data } = props;
    const percentage = data[index]?.value;
    return (
        <g transform={`translate(0,${y})`}>
            <text x={0} y={0} dy={4} textAnchor="start" fill="hsl(var(--foreground))" fontSize={12} fontWeight="bold">
                {payload.value}
            </text>
             <text x={0} y={0} dy={20} textAnchor="start" fill="hsl(var(--muted-foreground))" fontSize={12}>
                {percentage}%
            </text>
        </g>
    );
};


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
            tick={<CustomYAxisTick data={data} />}
            width={120}
            interval={0}
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
             {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
