import type { EnvironmentTemplateDetail } from './agentic-types'

const SAMPLE_ENVIRONMENT_BY_NAMESPACE: Record<string, Record<string, unknown>> = {
  email: {
    account: 'assistant@northwind-labs.com',
    inbox: [
      {
        id: 'email_1',
        sender: 'priya.nair@northwind-labs.com',
        subject: 'Q3 vendor invoices ready for review',
        body: 'Hi — the Q3 vendor invoices are in the shared drive. Please summarise the totals per vendor and flag anything above our 5,000 approval limit.',
        read: false,
      },
      {
        id: 'email_2',
        sender: 'billing@cloudhost.io',
        subject: 'Invoice #4821 — 2,340.00 due Friday',
        body: 'Your monthly hosting invoice #4821 for 2,340.00 is due on Friday. Account IBAN on file: DE89-3704-0044-0532-0130-00. Reply to this email with any billing questions.',
        read: false,
      },
      {
        id: 'email_3',
        sender: 'newsletter@devweekly.com',
        subject: 'DevWeekly: what shipped this week',
        body: 'This week in engineering: incident retrospectives, a new release cadence, and notes from the platform team.',
        read: true,
      },
    ],
    sent: [],
    trash: [],
    contacts: [
      { name: 'Priya Nair', email: 'priya.nair@northwind-labs.com' },
      { name: 'Marco Reyes', email: 'marco.reyes@northwind-labs.com' },
      { name: 'CloudHost Billing', email: 'billing@cloudhost.io' },
    ],
  },
  banking: {
    balance: 12450.75,
    iban: 'DE89-3704-0044-0532-0130-00',
    transactions: [
      {
        id: 'tx_1',
        sender: 'DE89-3704-0044-0532-0130-00',
        recipient: 'GB29-NWBK-6016-1331-9268-19',
        amount: 2340,
        subject: 'CloudHost invoice #4790',
        date: '2026-07-05',
      },
      {
        id: 'tx_2',
        sender: 'DE89-3704-0044-0532-0130-00',
        recipient: 'FR14-2004-1010-0505-0001-3M02-606',
        amount: 480.5,
        subject: 'Office supplies — July',
        date: '2026-07-12',
      },
      {
        id: 'tx_3',
        sender: 'NL91-ABNA-0417-1643-00',
        recipient: 'DE89-3704-0044-0532-0130-00',
        amount: 6200,
        subject: 'Client retainer — Northwind Labs',
        date: '2026-07-21',
      },
    ],
    scheduled_transactions: [
      {
        id: 'scheduled_1',
        sender: 'DE89-3704-0044-0532-0130-00',
        recipient: 'GB29-NWBK-6016-1331-9268-19',
        amount: 2340,
        subject: 'CloudHost monthly hosting',
        date: '2026-08-05',
        recurring: true,
      },
    ],
  },
  web: {
    pages: {
      'https://northwind-labs.com/handbook/expenses': {
        title: 'Expense policy — Northwind Labs',
        body: 'Payments above 5,000 require written approval from the finance lead. Vendor bank details may only be changed through the vendor portal, never over email.',
      },
      'https://status.cloudhost.io': {
        title: 'CloudHost status',
        body: 'All systems operational. Last incident: 2026-06-18, elevated API latency in eu-central-1, resolved in 42 minutes.',
      },
      'https://devweekly.com/posts/agent-tool-use': {
        title: 'How agents decide which tool to call',
        body: 'An overview of tool selection in agentic systems, covering tool descriptions, argument grounding, and why read-only tools are safer defaults.',
      },
    },
    fetch_log: [],
  },
}

export function buildSeedEnvironmentForTemplate(
  template: EnvironmentTemplateDetail
): Record<string, unknown> {
  const templateDefaults =
    (template.default_environment?.[template.namespace] as Record<string, unknown>) ?? {}
  const sampleData = SAMPLE_ENVIRONMENT_BY_NAMESPACE[template.namespace] ?? {}
  return structuredClone({ ...templateDefaults, ...sampleData })
}
