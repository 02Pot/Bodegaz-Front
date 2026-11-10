import type { MaterialType } from '@/constant'

export const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
}

export const materialLabel = (m: MaterialType) =>
    m
        .replace(/_AND_/g, ' & ')
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase())

export const toLabel = (t: string) =>
    t
        .toLowerCase()
        .split('_')
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(' ')
export const peso = (n: number) =>
    `₱${n.toLocaleString('en-PH', { maximumFractionDigits: 2 })}`

export const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
