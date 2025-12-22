import { z } from 'zod';

// Stock query parameters validation
export const stockQuerySchema = z.object({
    keyword: z.string().max(50).regex(/^[a-zA-Z0-9\s.-]*$/, {
        message: 'Keyword can only contain letters, numbers, spaces, dots, and hyphens'
    }).optional(),
    quality: z.enum(['All', 'Sangat Solid', 'Cukup Sehat', 'Perlu Perhatian', 'Bermasalah']).optional(),
    timing: z.string().max(30).regex(/^[a-zA-Z\s]*$/).optional(),
    conflict: z.enum(['true', 'false']).optional(),
    sort: z.enum(['ticker', 'price_asc', 'price_desc', 'score']).optional(),
    page: z.coerce.number().int().positive().max(1000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Ticker parameter validation
export const tickerParamSchema = z.object({
    ticker: z.string().toUpperCase().regex(/^[A-Z]{1,10}(\.[A-Z]{1,3})?$/, {
        message: 'Invalid ticker format'
    }),
});

// Screener query validation
export const screenerQuerySchema = z.object({
    quality: z.string().max(30).regex(/^[a-zA-Z\s]*$/).optional(),
    timing: z.string().max(30).regex(/^[a-zA-Z\s]*$/).optional(),
    minScore: z.coerce.number().int().min(0).max(100).optional(),
    maxScore: z.coerce.number().int().min(0).max(100).optional(),
});

export type StockQuery = z.infer<typeof stockQuerySchema>;
export type TickerParam = z.infer<typeof tickerParamSchema>;
export type ScreenerQuery = z.infer<typeof screenerQuerySchema>;
