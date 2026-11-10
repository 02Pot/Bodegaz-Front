import type { LeaseClause, LeaseTemplateConfig } from '@/types'

export const defaultConfig: LeaseTemplateConfig = {
    termMonths: 12,
    autoRenew: false,
    billingCycle: 'MONTHLY',
    billingDay: 1,
    gracePeriodDays: 5,
    lateFee: { type: 'PERCENT', value: 5 },
    deposit: { type: 'MONTHS_OF_RENT', value: 1 },
    depositRefundDays: 30,
    noticeDaysToTerminate: 30,
    defaultDays: 15,
    insuranceRequired: false,
    permittedItems: [],
    accessHours: '8:00 AM – 6:00 PM',
}

export const defaultClauses: LeaseClause[] = [
    {
        key: 'maintenance',
        title: 'Maintenance Responsibilities',
        body: 'The owner maintains the structure. The renter keeps the unit clean and reports damage.',
    },
    {
        key: 'cancellation',
        title: 'Cancellation',
        body: 'Either party may terminate with the notice period stated above.',
    },
    {
        key: 'renewal',
        title: 'Renewal',
        body: 'The lease renews only if auto-renew is enabled or both parties agree.',
    },
]
