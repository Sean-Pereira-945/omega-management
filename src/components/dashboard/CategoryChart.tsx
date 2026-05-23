import { memo, useMemo, useState } from 'react'
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from 'recharts'

type CategoryDatum = {
  name: string
  value: number
}

type CategoryChartProps = {
  data: CategoryDatum[]
}

const COLORS = ['#ff7a45', '#3fcaa4', '#6b6f84', '#c9b99a', '#ea5d2c']

function CategoryChart({ data }: CategoryChartProps) {
  const [showAll, setShowAll] = useState(false)
  const visibleLegend = useMemo(
    () => (showAll ? data : data.slice(0, 6)),
    [data, showAll],
  )

  return (
    <div role="img" aria-label="Category distribution chart">
      <div className="h-[280px] w-full">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={120}
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                borderColor: 'rgba(201, 185, 154, 0.6)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4">
        <div className="grid max-h-44 gap-2 overflow-y-auto pr-1 text-sm sm:grid-cols-2">
          {visibleLegend.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-[var(--text-muted)]">{entry.name}</span>
            </div>
          ))}
        </div>
        {data.length > 6 ? (
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="mt-3 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-primary)]"
          >
            {showAll ? 'Show less' : 'Show more'}
          </button>
        ) : null}
      </div>
    </div>
  )
}

export default memo(CategoryChart)
