interface Props {
  title: string;
  value: string;
  subtitle?: string;
}

export default function KPICard({
  title,
  value,
  subtitle
}: Props) {

  return (
    <div className="bg-white border rounded-lg p-5">

      <h3 className="text-gray-500">
        {title}
      </h3>

      <div className="text-4xl font-bold mt-4">
        {value}
      </div>

      <p className="text-sm text-gray-400 mt-2">
        {subtitle}
      </p>

    </div>
  );
}