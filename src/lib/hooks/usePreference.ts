import { useContext } from 'react'
import { PrefContext } from '../context/preferenceContext'

export const usePreferences = () => {
    const ctx = useContext(PrefContext)
    if (!ctx)
        throw new Error('usePreferences must be inside PreferencesProvider')
    return ctx
}
