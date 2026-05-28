interface KpiCardProps {
  title: string;
  icon: string;
  iconColorClass: string;
  value: string;
  children: React.ReactNode;
}

export default function KpiCard({ title, icon, iconColorClass, value, children }: KpiCardProps) {
  return (
    <div className="col-span-12 md:col-span-3 bg-surface-container-lowest border border-[#DEE2E6] rounded-lg p-5 flex flex-col justify-between shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-body-md font-body-md text-on-surface-variant font-medium">{title}</h3>
        <span className={`material-symbols-outlined ${iconColorClass}`}>{icon}</span>
      </div>
      <div>
        <div className="text-headline-lg font-headline-lg text-on-surface">{value}</div>
        {children}
      </div>
    </div>
  );
}
