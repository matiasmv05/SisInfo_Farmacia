import { AbcDistributionItem } from '../types/dashboard';

interface AbcDistributionProps {
  items: AbcDistributionItem[];
}

export default function AbcDistribution({ items }: AbcDistributionProps) {
  const getColorsForClass = (classType: string) => {
    switch (classType) {
      case 'A':
        return {
          bg: 'bg-[#6F42C1]',
          text: 'text-white',
          barBg: 'bg-[#6F42C1]',
        };
      case 'B':
        return {
          bg: 'bg-[#0056B3]',
          text: 'text-white',
          barBg: 'bg-[#0056B3]',
        };
      case 'C':
        return {
          bg: 'bg-[#6C757D]',
          text: 'text-white',
          barBg: 'bg-[#6C757D]',
        };
      default:
        return { bg: 'bg-gray-200', text: 'text-gray-800', barBg: 'bg-gray-500' };
    }
  };

  return (
    <div className="bg-surface-container-lowest border border-[#DEE2E6] rounded-lg p-5 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-headline-sm font-headline-sm text-on-surface">Distribución ABC</h3>
        <span className="material-symbols-outlined text-on-surface-variant">pie_chart</span>
      </div>
      <p className="text-body-sm font-body-sm text-on-surface-variant mb-5">Valor del inventario actual según clasificación.</p>
      
      <div className="space-y-4">
        {items.map((item) => {
          const colors = getColorsForClass(item.classType);
          
          return (
            <div key={item.id}>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-sm ${colors.bg} ${colors.text} flex items-center justify-center font-bold text-xs`}>
                    {item.classType}
                  </span>
                  <span className="text-body-sm font-medium">{item.investmentPercentage}% Inversión</span>
                </div>
                <span className="text-body-sm font-data-mono text-on-surface-variant">{item.skuPercentage}% SKUs</span>
              </div>
              <div className="w-full bg-surface-container rounded-full h-1.5">
                <div className={`${colors.barBg} h-1.5 rounded-full`} style={{ width: `${item.investmentPercentage}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
