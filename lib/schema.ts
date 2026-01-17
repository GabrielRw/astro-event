import { z } from 'zod';

// ============================================
// City Search Schemas
// ============================================

export const CitySearchQuerySchema = z.object({
  query: z.string().min(2, 'City name must be at least 2 characters'),
  limit: z.number().min(1).max(10).optional().default(5),
});

export type CitySearchQuery = z.infer<typeof CitySearchQuerySchema>;

export const CityResultSchema = z.object({
  name: z.string(),
  country: z.string(),
  lat: z.number(),
  lng: z.number(),
  timezone: z.string(),
  population: z.number().optional(),
});

export type CityResult = z.infer<typeof CityResultSchema>;

export const CitySearchResponseSchema = z.object({
  results: z.array(CityResultSchema),
  count: z.number(),
});

export type CitySearchResponse = z.infer<typeof CitySearchResponseSchema>;

// ============================================
// Natal Chart Schemas
// ============================================

export const HouseSystemSchema = z.enum([
  'placidus',
  'whole_sign',
  'equal',
  'regiomontanus',
  'koch',
  'porphyry',
  'campanus',
  'topocentric',
]);

export type HouseSystem = z.infer<typeof HouseSystemSchema>;

export const ZodiacTypeSchema = z.enum(['tropical', 'sidereal']);
export type ZodiacType = z.infer<typeof ZodiacTypeSchema>;

export const ExtraBodySchema = z.enum(['chiron', 'lilith', 'true_node', 'mean_node']);
export type ExtraBody = z.infer<typeof ExtraBodySchema>;

// Form schema for client-side validation
// Using separate input type for react-hook-form compatibility
export const NatalFormSchema = z.object({
  name: z.string().optional(),
  date: z.string().min(1, 'Birth date is required'),
  time: z.string().min(1, 'Birth time is required'),
  timeUnknown: z.boolean().default(false),
  city: z.string().min(1, 'City is required'),
  lat: z.number({ message: 'Please select a city from the suggestions' }),
  lng: z.number({ message: 'Please select a city from the suggestions' }),
  timezone: z.string().min(1, 'Timezone is required'),
  houseSystem: HouseSystemSchema.default('placidus'),
  zodiacType: ZodiacTypeSchema.default('tropical'),
  includeFeatures: z.array(ExtraBodySchema).default([]),
});

// Input type for the form (before defaults are applied)
export type NatalFormInput = z.input<typeof NatalFormSchema>;
// Output type (after defaults are applied)
export type NatalFormData = z.output<typeof NatalFormSchema>;

// API request schema (what we send to FreeAstroAPI)
export const NatalApiRequestSchema = z.object({
  name: z.string().optional(),
  year: z.number(),
  month: z.number().min(1).max(12),
  day: z.number().min(1).max(31),
  hour: z.number().min(0).max(23),
  minute: z.number().min(0).max(59),
  city: z.string().optional(),
  lat: z.number(),
  lng: z.number(),
  tz_str: z.string(),
  house_system: HouseSystemSchema.optional(),
  zodiac_type: ZodiacTypeSchema.optional(),
  include_speed: z.boolean().optional(),
  include_features: z.array(z.string()).optional(),
  orb_settings: z.record(z.string(), z.number()).optional(),
});

export type NatalApiRequest = z.infer<typeof NatalApiRequestSchema>;

// ============================================
// API Response Types (based on FreeAstroAPI docs)
// ============================================

export interface Planet {
  id: string;
  name: string;
  sign: string;
  pos: number;
  abs_pos: number;
  house: number;
  retrograde: boolean;
  speed?: number;
  is_stationary?: boolean;
}

export interface House {
  house: number;
  name: string;
  sign: string;
  pos: number;
  abs_pos: number;
}

export interface Aspect {
  p1: string;
  p2: string;
  type: string;
  orb: number;
  deg: number;
  is_major: boolean;
}

export interface NatalChartSubject {
  name: string;
  city?: string;
  settings: {
    house_system: string;
    julian_day: number;
    zodiac_type: string;
  };
}

export interface NatalChartResponse {
  subject: NatalChartSubject;
  planets: Planet[];
  houses: House[];
  aspects: Aspect[];
}

// ============================================
// Error Response
// ============================================

export interface ApiError {
  error: string;
  message: string;
  details?: unknown;
}
