import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CardGoldProps {
  title?: string
  description?: string
  value?: string | number
  children?: React.ReactNode
  className?: string
}

export function CardGold({ title, description, value, children, className }: CardGoldProps) {
  // 🌈 Pilih warna otomatis berdasarkan nilai numerik (jika ada)
  const numericValue =
    typeof value === "string" && !isNaN(Number(value)) ? Number(value) : undefined

  let valueColor = "text-yellow-400"
  if (numericValue !== undefined) {
    if (numericValue === 0) valueColor = "text-gray-500"
    else if (numericValue > 0 && numericValue < 100) valueColor = "text-green-400"
    else if (numericValue >= 100) valueColor = "text-emerald-400"
  }

  return (
    <Card
      className={`w-full bg-zinc-900 border border-zinc-800 rounded-2xl shadow-lg transition hover:shadow-yellow-500/10 ${className ?? ""}`}
    >
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle className="text-zinc-400">{title}</CardTitle>}
          {description && <p className="text-sm text-zinc-500">{description}</p>}
        </CardHeader>
      )}
      <CardContent>
        {value !== undefined ? (
          <p className={`text-xl font-bold ${valueColor}`}>{value}</p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}
