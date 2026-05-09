import React from "react";
import type { MonthlyStats } from "../utils/processNOAA";

interface MonthlyStatsTableProps {
  data: MonthlyStats[];
}

export function MonthlyStatsTable({ data }: MonthlyStatsTableProps) {
  if (data.length === 0) {
    return <div>No data to display</div>;
  }

  return (
    <table className="monthly-stats-table">
      <thead>
        <tr>
          <th>Month</th>
          <th>Avg Temp (°C)</th>
          <th>Min Temp (°C)</th>
          <th>Max Temp (°C)</th>
          <th>Total Precip (mm)</th>
          <th>Avg Humidity (%)</th>
          <th>Sunny Days</th>
        </tr>
      </thead>
      <tbody>
        {data.map((stat) => (
          <tr key={stat.yearMonth}>
            <td>{stat.yearMonth}</td>
            <td>{stat.avgTemp.toFixed(1)}</td>
            <td>{stat.minTemp.toFixed(1)}</td>
            <td>{stat.maxTemp.toFixed(1)}</td>
            <td>{stat.totalPrecip.toFixed(1)}</td>
            <td>{stat.avgHumidity.toFixed(1)}</td>
            <td>{stat.sunnyDays}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
