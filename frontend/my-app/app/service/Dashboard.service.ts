export const getDashboardData = async () => {

  // TODO:
  // Aquí consumirás:
  // GET /dashboard

  return {
    kpis: [
      {
        title: "Alertas Activas",
        value: "24",
        subtitle: "8 críticas",
        icon: "warning"
      },
      {
        title: "% Stock Crítico",
        value: "4.2%",
        subtitle: "Total SKUs",
        icon: "trending_down"
      }
    ],

    alerts: [
      {
        sku: "AMX-500-24",
        product: "Amoxicilina 500mg",
        category: "Antibióticos",
        stock: 5,
        status: "STOCK CRÍTICO"
      }
    ]
  };
};