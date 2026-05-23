import Panel from '../components/common/Panel'
import ScrollReveal from '../components/common/ScrollReveal'

const dockRows = [
  {
    dock: 'Dock 1',
    status: 'Loading',
    carrier: 'Swift',
    eta: '10:45 AM',
  },
  {
    dock: 'Dock 2',
    status: 'Idle',
    carrier: '--',
    eta: '--',
  },
  {
    dock: 'Dock 3',
    status: 'Unloading',
    carrier: 'K-Line',
    eta: '11:20 AM',
  },
]

const statusStyles: Record<string, string> = {
  Loading: 'bg-mint-500 text-ink-900',
  Unloading: 'bg-sun-500 text-white',
  Idle: 'bg-[var(--surface-muted)] text-[var(--text-primary)]',
}

export default function WarehousePage() {
  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <ScrollReveal delay={0}>
          <Panel title="Active docks" subtitle="Currently in use">
            <p className="text-3xl font-semibold text-[var(--text-primary)]">2</p>
          </Panel>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <Panel title="Outbound loads" subtitle="Queued today">
            <p className="text-3xl font-semibold text-[var(--text-primary)]">17</p>
          </Panel>
        </ScrollReveal>
        <ScrollReveal delay={200}>
          <Panel title="Receiving" subtitle="Inbound pallets">
            <p className="text-3xl font-semibold text-[var(--text-primary)]">42</p>
          </Panel>
        </ScrollReveal>
      </div>

      <ScrollReveal delay={100}>
        <Panel title="Dock schedule" subtitle="Current dock utilization">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[var(--surface-muted)] text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                <tr>
                  <th scope="col" className="px-6 py-4">Dock</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4">Carrier</th>
                  <th scope="col" className="px-6 py-4">Next ETA</th>
                </tr>
              </thead>
              <tbody>
                {dockRows.map((row) => (
                  <tr key={row.dock} className="border-t border-[var(--border)]">
                    <td className="px-6 py-4 font-semibold text-[var(--text-primary)]">
                      {row.dock}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                          statusStyles[row.status]
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-muted)]">{row.carrier}</td>
                    <td className="px-6 py-4 text-[var(--text-muted)]">{row.eta}</td>
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
