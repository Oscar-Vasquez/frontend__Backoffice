"use client";

import { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';

function ShipmentTypeDistribution() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        // Destruir el gráfico anterior si existe
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        // Crear nuevo gráfico
        chartInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Envíos Aéreos', 'Envíos Marítimos'],
            datasets: [{
              data: [60, 40],
              backgroundColor: [
                'rgba(59, 130, 246, 0.8)',
                'rgba(6, 182, 212, 0.8)'
              ],
              borderColor: [
                'rgb(59, 130, 246)',
                'rgb(6, 182, 212)'
              ],
              borderWidth: 1,
              offset: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  usePointStyle: true,
                  padding: 20,
                  font: {
                    size: 12
                  }
                }
              },
              tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                padding: 10,
                callbacks: {
                  label: function(context) {
                    const value = context.raw as number;
                    const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
                    const percentage = Math.round((value / total) * 100);
                    return `${context.label}: ${percentage}%`;
                  }
                }
              }
            }
          }
        });
      }
    }

    // Cleanup
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className="h-[300px] w-full">
      <canvas ref={chartRef}></canvas>
    </div>
  );
}

export default ShipmentTypeDistribution; 