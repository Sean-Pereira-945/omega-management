import Panel from '../components/common/Panel'
import ScrollReveal from '../components/common/ScrollReveal'

const orders = [
  {
    id: 'PO-4831',
    vendor: 'Northline Supply',
    eta: 'May 28',
    items: 18,
    total: '$14,280',
    status: 'In transit',
  },
  {
    id: 'PO-4792',
    vendor: 'Metro Distributors',
    eta: 'May 24',
    items: 6,
    total: '$4,910',
    status: 'Arrived',
  },
  {
    id: 'PO-4744',
    vendor: 'Allied Parts',
    eta: 'Jun 01',
    items: 9,
    total: '$8,200',
    status: 'Pending',
  },
]

const statusStyles: Record<string, string> = {
  'In transit': 'bg-mint-500 text-ink-900',
  Arrived: 'bg-ink-900 text-white',
  Pending: 'bg-sun-500 text-white',
}

export default function StockOrdersPage() {
  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <ScrollReveal delay={0}>
          <Panel title="Open orders" subtitle="Active purchase orders">
            <p className="text-3xl font-semibold text-[var(--text-primary)]">12</p>
          </Panel>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <Panel title="Inbound value" subtitle="Orders in transit">
            <p className="text-3xl font-semibold text-[var(--text-primary)]">$84,320</p>
          </Panel>
        </ScrollReveal>
        <ScrollReveal delay={200}>
          <Panel title="Supplier score" subtitle="Last 30 days">
            <p className="text-3xl font-semibold text-[var(--text-primary)]">4.6/5</p>
          </Panel>
        </ScrollReveal>
      </div>

      <ScrollReveal delay={100}>
        <Panel title="Stock orders" subtitle="Recent purchase orders">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[var(--surface-muted)] text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                <tr>
                  <th scope="col" className="px-6 py-4">Order</th>
                  <th scope="col" className="px-6 py-4">Vendor</th>
                  <th scope="col" className="px-6 py-4">ETA</th>
                  <th scope="col" className="px-6 py-4">Items</th>
                  <th scope="col" className="px-6 py-4">Total</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t border-[var(--border)]">
                    <td className="px-6 py-4 font-semibold text-[var(--text-primary)]">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 text-[var(--text-primary)]">{order.vendor}</td>
                    <td className="px-6 py-4 text-[var(--text-muted)]">{order.eta}</td>
                    <td className="px-6 py-4 text-[var(--text-muted)]">{order.items}</td>
                    <td className="px-6 py-4 text-[var(--text-muted)]">{order.total}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                          statusStyles[order.status]
                        }`}
                      >
                        {order.status}
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
