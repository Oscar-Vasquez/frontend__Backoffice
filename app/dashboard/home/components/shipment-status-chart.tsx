"use client";

import { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';

function ShipmentStatusChart() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        chartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['En Tránsito', 'En Puerto/Aeropuerto', 'En Aduana', 'Entregado', 'Retrasado'],
            datasets: [
              {
                label: 'Envíos Aéreos',
                data: [65, 45, 30, 95, 10],
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1,
                borderRadius: 4,
                barPercentage: 0.6,
              },
              {
                label: 'Envíos Marítimos',
                data: [45, 60, 35, 80, 15],
                backgroundColor: 'rgba(6, 182, 212, 0.8)',
                borderColor: 'rgb(6, 182, 212)',
                borderWidth: 1,
                borderRadius: 4,
                barPercentage: 0.6,
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                align: 'end',
                labels: {
                  usePointStyle: true,
                  padding: 20,
                  font: {
                    size: 12
                  }
                }
              },
              tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                padding: 10,
                callbacks: {
                  label: function(context) {
                    let label = context.dataset.label || '';
                    if (label) {
                      label += ': ';
                    }
                    if (context.parsed.y !== null) {
                      label += context.parsed.y + ' envíos';
                    }
                    return label;
                  }
                }
              }
            },
            scales: {
              x: {
                grid: {
                  display: false
                },
                ticks: {
                  color: '#64748b'
                }
              },
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)',
                },
                ticks: {
                  color: '#64748b',
                  stepSize: 20
                },
                border: {
                  display: false
                }
              }
            },
            interaction: {
              intersect: false,
              mode: 'index'
            }
          }
        });
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className="h-[400px] w-full">
      <canvas ref={chartRef}></canvas>
    </div>
  );
}

export default ShipmentStatusChart; 