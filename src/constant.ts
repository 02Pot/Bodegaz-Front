export const BASE_URL = import.meta.env.VITE_BASE_URL as string;
export const API_URL = import.meta.env.VITE_API_URL as string;

export const pageTitles: Record<string,{title:string; subtitle: string}> = {
    '/': {
        title: 'Find Rentals',
        subtitle: 'Browse verified industrial spaces, check real-time availability, and book leases'
    },
    '/my-rental': {
        title: 'My Rentals',
        subtitle: 'View and manage your warehouse'
    },
    '/saved-rental': {
        title: 'Saved Rentals',
        subtitle: 'View bookmarked warehouse'
    },    
    '/lease-agree': {
        title: 'Lease Agreements',
        subtitle: 'Review and download your signed leases'
    },
    '/supp-inq': {
        title: 'Support & Inquiries',
        subtitle: 'Get help or reach out to a warehouse owner'
    },
    '/settings': {
        title: 'Settings',
        subtitle: 'Manage your account, notifications, and preferences',
    },
}

export const MATERIAL_TYPES = [
    // General & ambient goods
    "GENERAL_DRY_GOODS",
    "RAW_MATERIALS",
    "FINISHED_GOODS",
    "ELECTRONICS_AND_TECH",
    "TEXTILES_AND_APPAREL",
    "AUTOMOTIVE_PARTS",

    // Temperature-controlled & perishables
    "PERISHABLE_FOOD",
    "FROZEN_GOODS",
    "PHARMACEUTICALS_MEDICAL",

    // Hazardous & regulated
    "FLAMMABLE_LIQUIDS",
    "FLAMMABLE_SOLIDS",
    "CORROSIVES",
    "TOXIC_CHEMICALS",
    "GASES_COMPRESSED",
    "HAZARDOUS_MISC",

    // Heavy, oversized & bulk
    "HEAVY_MACHINERY",
    "CONSTRUCTION_MATERIALS",
    "BULK_LIQUIDS",
    "BULK_DRY",

    // High-value & sensitive
    "HIGH_VALUE_SECURE",
    "FRAGILE_GLASS_CERAMIC",
    "DOCUMENTS_ARCHIVES",
] as const;

export type MaterialType = (typeof MATERIAL_TYPES)[number];