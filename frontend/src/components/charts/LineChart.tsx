import React from 'react';
import { Line } from 'react-chartjs-2';
import ChartWrapper from './ChartWrapper';

interface LineChartProps {
  title: string;
  data: any[];
  xKey: string;
  yKey: string;
  label: string;
  color?: string;
}

const LineChart: React.FC<LineChartProps> = ({ 
  title, 
  data, 
  xKey, 
  yKey, 
  label, 
  color = 'hsl(217, 91%, 60%)' 
}) => {
  const chartData = {
    labels: data.map(item => item[xKey]),
    datasets: [
      {
        label,
        data: data.map(item => item[yKey]),
        borderColor: color,
        backgroundColor: color.replace('60%)', '10%)'),
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: color,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'hsl(215, 25%, 12%)',
        titleColor: 'hsl(215, 20%, 92%)',
        bodyColor: 'hsl(215, 20%, 92%)',
        borderColor: color,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'hsl(215, 20%, 92%)',
          borderColor: 'hsl(215, 25%, 15%)',
        },
        ticks: {
          color: 'hsl(215, 12%, 50%)',
          font: {
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: 'hsl(215, 20%, 92%)',
          borderColor: 'hsl(215, 25%, 15%)',
        },
        ticks: {
          color: 'hsl(215, 12%, 50%)',
          font: {
            size: 12,
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  return (
    <ChartWrapper title={title}>
      <Line data={chartData} options={options} />
    </ChartWrapper>
  );
};

export default LineChart;