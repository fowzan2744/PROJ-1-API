import React from 'react';
import { Bar } from 'react-chartjs-2';
import ChartWrapper from './ChartWrapper';

interface BarChartProps {
  title: string;
  data: any[];
  xKey: string;
  yKey: string;
  label: string;
  color?: string;
}

const BarChart: React.FC<BarChartProps> = ({ 
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
        backgroundColor: color.replace('60%)', '20%)'),
        borderColor: color,
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
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
          display: false,
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
  };

  return (
    <ChartWrapper title={title}>
      <Bar data={chartData} options={options} />
    </ChartWrapper>
  );
};

export default BarChart;