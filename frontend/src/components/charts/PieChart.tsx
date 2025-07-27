import React from 'react';
import { Pie } from 'react-chartjs-2';
import ChartWrapper from './ChartWrapper';

interface PieChartProps {
  title: string;
  data: any[];
  labelKey: string;
  valueKey: string;
  colors?: string[];
}

const PieChart: React.FC<PieChartProps> = ({ 
  title, 
  data, 
  labelKey, 
  valueKey, 
  colors = [
    'hsl(217, 91%, 60%)',
    'hsl(142, 76%, 36%)',
    'hsl(38, 92%, 50%)',
    'hsl(0, 84%, 60%)',
    'hsl(280, 100%, 70%)',
    'hsl(160, 100%, 75%)',
  ]
}) => {
  const chartData = {
    labels: data.map(item => item[labelKey]),
    datasets: [
      {
        data: data.map(item => item[valueKey]),
        backgroundColor: colors.slice(0, data.length),
        borderColor: colors.slice(0, data.length),
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          color: 'hsl(215, 12%, 50%)',
          font: {
            size: 12,
          },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'hsl(215, 25%, 12%)',
        titleColor: 'hsl(215, 20%, 92%)',
        bodyColor: 'hsl(215, 20%, 92%)',
        borderColor: 'hsl(217, 91%, 60%)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
      },
    },
  };

  return (
    <ChartWrapper title={title}>
      <Pie data={chartData} options={options} />
    </ChartWrapper>
  );
};

export default PieChart;