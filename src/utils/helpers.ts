import type { MaterialType } from "@/constant";

export const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
}

export const materialLabel = (m: MaterialType) =>
    m.replace(/_AND_/g, " & ")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());