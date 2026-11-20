import type { Currency, Units } from '@/constant'
import { createContext } from 'react'

export interface Preferences {
    currency: Currency
    setCurrency: (c: Currency) => void
    formatPrice: (amountInPhp: number | null | undefined) => string
    symbol: string
    units: Units
    setUnits: (u: Units) => void
    weightUnit: string
    volumeUnit: string
    formatWeight: (kg: number | null | undefined) => string
    formatVolume: (m3: number | null | undefined) => string
    formatPricePerVolume: (pricePerM3: number | null | undefined) => string
    toBaseWeight: (value: number) => number
    toBaseVolume: (value: number) => number
}

export const PrefContext = createContext<Preferences | null>(null)
