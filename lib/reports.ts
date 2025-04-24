export async function generateMetricsReport() {
  // Obtener datos de las diferentes métricas
  const deliveryData = {
    enRuta: 8,
    entregados: 10,
    total: 25,
    porcentaje: 72
  };

  const branchData = [
    {
      nombre: "Sucursal Centro",
      ingresos: 125000,
      paquetesTotal: 450,
      entregados: 380,
      recibidos: 420,
    },
    {
      nombre: "Sucursal Norte",
      ingresos: 98000,
      paquetesTotal: 320,
      entregados: 290,
      recibidos: 310,
    },
    {
      nombre: "Sucursal Sur",
      ingresos: 115000,
      paquetesTotal: 380,
      entregados: 350,
      recibidos: 365,
    },
  ];

  // Generar CSV
  const headers = [
    "Métrica",
    "Valor",
    "Porcentaje",
    "Detalles"
  ].join(",");

  const rows = [
    headers,
    `Estado de Entregas,${deliveryData.entregados}/${deliveryData.total},${deliveryData.porcentaje}%,En Ruta: ${deliveryData.enRuta}`,
    "",
    "Sucursal,Ingresos,Paquetes Totales,Entregados,Recibidos",
    ...branchData.map(branch =>
      `${branch.nombre},${branch.ingresos},${branch.paquetesTotal},${branch.entregados},${branch.recibidos}`
    )
  ].join("\n");

  return rows;
}
