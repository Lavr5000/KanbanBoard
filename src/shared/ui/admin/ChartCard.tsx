interface ChartCardProps {
  title: string
  children: React.ReactNode
  description?: string
}

export function ChartCard({ title, children, description }: ChartCardProps) {
  return (
    <div className="bg-[#1a1a20] rounded-xl p-5 border border-gray-800 hover:border-gray-700 transition-all">
      <div className="mb-4">
        <h3 className="text-white font-semibold">{title}</h3>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}
