declare module "recharts" {
  import React from "react";

  export interface TooltipPayloadEntry {
    name?: string;
    value?: string | number;
    payload?: any;
    color?: string;
  }

  export interface TooltipProps {
    active?: boolean;
    payload?: TooltipPayloadEntry[];
    label?: string;
    contentStyle?: React.CSSProperties;
    formatter?: (value: any, name?: string) => [any, string] | React.ReactNode;
  }

  export const Tooltip: React.FC<TooltipProps & any>;
  export const ResponsiveContainer: React.FC<{
    width?: string | number;
    height?: string | number;
    children?: React.ReactNode;
    debounce?: number;
    aspect?: number;
  }>;
  export const BarChart: React.FC<{
    data: any[];
    width?: number;
    height?: number;
    layout?: "horizontal" | "vertical";
    margin?: { top?: number; right?: number; bottom?: number; left?: number };
    children?: React.ReactNode;
  }>;
  export const Bar: React.FC<{
    dataKey: string;
    fill?: string;
    radius?: [number, number, number, number] | number;
    barSize?: number;
    children?: React.ReactNode;
  }>;
  export const XAxis: React.FC<{
    type?: "number" | "category";
    dataKey?: string;
    tick?: any;
    axisLine?: boolean;
    tickLine?: boolean;
    width?: number;
  }>;
  export const YAxis: React.FC<{
    type?: "number" | "category";
    dataKey?: string;
    tick?: any;
    axisLine?: boolean;
    tickLine?: boolean;
    width?: number;
  }>;
  export const Cell: React.FC<{
    key?: string | number;
    fill?: string;
    opacity?: number;
  }>;
}
