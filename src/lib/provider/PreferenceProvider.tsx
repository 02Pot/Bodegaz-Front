import type { Currency, Units } from '@/constant'
import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react'
import { PrefContext, type Preferences } from '../context/preferenceContext'

const RATES: Record<Currency, number> = { PHP: 1, USD: 0.017 }
const SYMBOLS: Record<Currency, string> = { PHP: '₱', USD: '$' }
const KEY = 'preferences.currency'
const KG_TO_LB = 2.20462
const M3_TO_FT3 = 35.3147
const UNITS_KEY = 'preferences.units'

const readCurrency = (): Currency => {
    try {
        const v = localStorage.getItem(KEY)
        return v === 'USD' || v === 'PHP' ? v : 'PHP'
    } catch {
        return 'PHP'
    }
}

const readUnits = (): Units => {
    try {
        return localStorage.getItem(UNITS_KEY) === 'imperial'
            ? 'imperial'
            : 'metric'
    } catch {
        return 'metric'
    }
}

const FALLBACK = '—'
const valid = (n: number | null | undefined): n is number =>
    typeof n === 'number' && Number.isFinite(n)

const num = (n: number) =>
    new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n)

export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
    const [currency, setCurrency] = useState<Currency>(readCurrency)
    const [units, setUnits] = useState<Units>(readUnits)

    useEffect(() => {
        try {
            localStorage.setItem(KEY, currency)
            localStorage.setItem(UNITS_KEY, units)
        } catch {
            console.log('error')
        }
    }, [currency, units])

    const imperial = units === 'imperial'
    const weightUnit = imperial ? 'lb' : 'kg'
    const volumeUnit = imperial ? 'ft³' : 'm³'
    const wFactor = imperial ? KG_TO_LB : 1
    const vFactor = imperial ? M3_TO_FT3 : 1

    const formatWeight = useCallback(
        (kg: number | null | undefined) =>
            valid(kg) ? `${num(kg * wFactor)} ${weightUnit}` : FALLBACK,
        [wFactor, weightUnit]
    )
    const formatVolume = useCallback(
        (m3: number | null | undefined) =>
            valid(m3) ? `${num(m3 * vFactor)} ${volumeUnit}` : FALLBACK,
        [vFactor, volumeUnit]
    )

    const formatPrice = useCallback(
        (amount: number | null | undefined) =>
            valid(amount)
                ? new Intl.NumberFormat(undefined, {
                      style: 'currency',
                      currency,
                  }).format(amount * RATES[currency])
                : FALLBACK,
        [currency]
    )
    const formatPricePerVolume = useCallback(
        (p: number | null | undefined) =>
            valid(p) ? `${formatPrice(p / vFactor)} / ${volumeUnit}` : FALLBACK,
        [formatPrice, vFactor, volumeUnit]
    )
    const toBaseWeight = useCallback((v: number) => v / wFactor, [wFactor])
    const toBaseVolume = useCallback((v: number) => v / vFactor, [vFactor])

    const value = useMemo<Preferences>(
        () => ({
            currency,
            setCurrency,
            formatPrice,
            symbol: SYMBOLS[currency],
            units,
            setUnits,
            weightUnit,
            volumeUnit,
            formatWeight,
            formatVolume,
            formatPricePerVolume,
            toBaseWeight,
            toBaseVolume,
        }),
        [
            currency,
            formatPrice,
            units,
            weightUnit,
            volumeUnit,
            formatWeight,
            formatVolume,
            formatPricePerVolume,
            toBaseWeight,
            toBaseVolume,
        ]
    )

    return <PrefContext.Provider value={value}>{children}</PrefContext.Provider>
}
