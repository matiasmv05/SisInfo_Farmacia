interface Props {
  alerts: any[];
}

export default function AlertsTable({
  alerts
}: Props) {

  return (
    <div className="bg-white border rounded-lg">

      <div className="p-5 border-b">
        Alertas Críticas
      </div>

      <table className="w-full">

        <thead>
          <tr>
            <th>SKU</th>
            <th>Producto</th>
            <th>Stock</th>
          </tr>
        </thead>

        <tbody>

          {alerts.map((item, index) => (
            <tr key={index}>

              <td>{item.sku}</td>

              <td>{item.product}</td>

              <td>{item.stock}</td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}