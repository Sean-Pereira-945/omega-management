import Panel from '../components/common/Panel'
import ScrollReveal from '../components/common/ScrollReveal'

const inventoryRows = [
  {
    sku: 'OM-2041',
    item: 'Warehouse Rack',
    location: 'Aisle 3',
    onHand: 58,
    reorderPoint: 20,
    status: 'Stable',
  },
  {
    sku: 'OM-1830',
    item: 'Packing Tape',
    location: 'Aisle 1',
    onHand: 12,
    reorderPoint: 30,
    status: 'Reorder',
  },
  {
    sku: 'OM-7721',
    item: 'Barcode Scanner',
    location: 'Aisle 4',
    onHand: 7,
    reorderPoint: 10,
    status: 'Low',
  },
]

const statusStyles: Record<string, string> = {
  Stable: 'bg-mint-500 text-ink-900',
  Reorder: 'bg-sun-600 text-white',
  Low: 'bg-sun-500 text-white',
}

export default function InventoryPage() {
  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <ScrollReveal delay={0}>
          <Panel title="Total SKUs" subtitle="Active inventory lines">
            <p className="text-3xl font-semibold text-[var(--text-primary)]">248</p>
          </Panel>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <Panel title="Critical items" subtitle="Below reorder point">
            <p className="text-3xl font-semibold text-[var(--text-primary)]">14</p>
          </Panel>
        </ScrollReveal>
        <ScrollReveal delay={200}>
          <Panel title="Fulfillment rate" subtitle="Last 7 days">
            <p className="text-3xl font-semibold text-[var(--text-primary)]">96.4%</p>
          </Panel>
        </ScrollReveal>
      </div>

      <ScrollReveal delay={100}>
        <Panel title="Inventory overview" subtitle="High priority restocks">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[var(--surface-muted)] text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                <tr>
                  <th scope="col" className="px-6 py-4">SKU</th>
                  <th scope="col" className="px-6 py-4">Item</th>
                  <th scope="col" className="px-6 py-4">Location</th>
                  <th scope="col" className="px-6 py-4">On hand</th>
                  <th scope="col" className="px-6 py-4">Reorder point</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {inventoryRows.map((row) => (
                  <tr key={row.sku} className="border-t border-[var(--border)]">
                    <td className="px-6 py-4 font-semibold text-[var(--text-primary)]">
                      {row.sku}
                    </td>
                    <td className="px-6 py-4 text-[var(--text-primary)]">{row.item}</td>
                    <td className="px-6 py-4 text-[var(--text-muted)]">{row.location}</td>
                    <td className="px-6 py-4 text-[var(--text-muted)]">{row.onHand}</td>
                    <td className="px-6 py-4 text-[var(--text-muted)]">{row.reorderPoint}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                          statusStyles[row.status]
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </ScrollReveal>
    </section>
  )
}
