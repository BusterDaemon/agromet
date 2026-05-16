import React from "react";
import type { MonthlyStats } from "../utils/processNOAA";

interface MonthlyStatsTableProps {
  data: MonthlyStats[];
}

export function MonthlyStatsTable({ data }: MonthlyStatsTableProps) {
  if (data.length === 0) {
    return <div>Нету данных для отображения</div>;
  }

  return (
    <table className="monthly-stats-table">
      <thead>
        <tr>
          <th>Месяц</th>
          <th>Средняя температура (°C)</th>
          <th>Минимальная температура (°C)</th>
          <th>Максимальная температура (°C)</th>
          <th>Суммарное количество осадков (мм.)</th>
          <th>Средняя влажность (%)</th>
          <th>Количество солнечных дней</th>
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
