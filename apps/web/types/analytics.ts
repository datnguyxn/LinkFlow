export interface ChartBar {
  id: string;
  value: number;
  color: string;
}

export interface AnalyticsOverviewCard {
  title: string;
  description: string;
  chart: ChartBar[];
}
