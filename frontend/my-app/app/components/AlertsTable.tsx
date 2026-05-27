import { InventoryAlert } from '../types/dashboard';

interface AlertsTableProps {
  alerts: InventoryAlert[];
}

export default function AlertsTable({ alerts }: AlertsTableProps) {
  return (
    <div className="col-span-12 md:col-span-8 bg-surface-container-lowest border border-[#DEE2E6] rounded-lg shadow-sm flex flex-col">
      <div className="p-5 border-b border-[#DEE2E6] flex justify-between items-center">
        <h3 className="text-headline-sm font-headline-sm text-on-surface">Alertas Críticas de Inventario</h3>
        <button className="text-primary text-label-md font-label-md hover:underline">Ver todas</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface border-b border-[#DEE2E6] text-label-md font-label-md text-on-surface-variant uppercase tracking-wider sticky top-0">
              <th className="py-3 px-5 w-4 font-medium"></th>
              <th className="py-3 px-2 font-medium">SKU / Producto</th>
              <th className="py-3 px-2 font-medium">Categoría</th>
              <th className="py-3 px-2 font-medium text-right">Stock Actual</th>
              <th className="py-3 px-2 font-medium">Estado</th>
              <th className="py-3 px-5 font-medium text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="text-body-sm font-body-sm text-on-surface">
            {alerts.map((alert) => {
              const bgClass =
                alert.statusColor === 'error'
                  ? 'bg-error'
                  : alert.statusColor === 'warning'
                  ? 'bg-[#d97706]'
                  : 'bg-primary';

              const textClass =
                alert.statusColor === 'error'
                  ? 'text-error'
                  : alert.statusColor === 'warning'
                  ? 'text-[#d97706]'
                  : 'text-primary';

              const badgeBgClass =
                alert.statusColor === 'error'
                  ? 'bg-error/10'
                  : alert.statusColor === 'warning'
                  ? 'bg-[#d97706]/10'
                  : 'bg-primary/10';

              const isEyeAction = alert.status === 'VENCE < 15 DÍAS';

              return (
                <tr key={alert.id} className="border-b border-[#DEE2E6] hover:bg-[#F0F7FF] transition-colors relative group">
                  <td className="p-0">
                    <div className={`w-1 h-full absolute left-0 top-0 bottom-0 ${bgClass}`}></div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="font-data-mono text-data-mono font-medium">{alert.sku}</div>
                    <div className="text-on-surface-variant truncate w-48">{alert.productName}</div>
                  </td>
                  <td className="py-3 px-2">{alert.category}</td>
                  <td className={`py-3 px-2 text-right font-data-mono ${textClass} font-medium`}>
                    {alert.currentStock}
                  </td>
                  <td className="py-3 px-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-sm text-[10px] font-bold ${badgeBgClass} ${textClass}`}>
                      {alert.status}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-center">
                    <button className="text-primary hover:text-primary-container">
                      <span className="material-symbols-outlined text-[18px]">
                        {isEyeAction ? 'visibility' : 'add_shopping_cart'}
                      </span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
