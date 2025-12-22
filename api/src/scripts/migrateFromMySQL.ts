/**
 * MySQL to MongoDB Migration Script
 * 
 * This script connects to your MySQL database, fetches all stock data,
 * transforms it to match the MongoDB Stock schema, and inserts/updates
 * the data in MongoDB Atlas.
 * 
 * Usage (Manual):
 *   npx ts-node src/scripts/migrateFromMySQL.ts
 * 
 * Environment Variables Required (add to .env):
 *   MYSQL_HOST=localhost
 *   MYSQL_USER=your_mysql_user
 *   MYSQL_PASSWORD=your_mysql_password
 *   MYSQL_DATABASE=your_database_name
 *   MONGO_URI=your_mongodb_atlas_uri
 */

import mysql from 'mysql2/promise';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// MySQL connection config
const mysqlConfig = {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'flexbit',
};

// Transform MySQL row to MongoDB document
function transformToMongoDB(row: any) {
    return {
        ticker: row.ticker,
        companyName: row.company_name,
        sector: row.sector,
        industry: row.industry,
        logo: row.logo,
        isFinancialSector: row.is_financial_sector === 1,
        financials: {
            dividendYield: row.dividend_yield ? parseFloat(row.dividend_yield) : null,
            lastUpdated: row.updated_at ? new Date(row.updated_at) : new Date(),
        },
        analysis: {
            flexbitScore: row.flexbit_score,
            businessQuality: row.business_quality_label,
            timingScore: row.timing_score,
            timingLabel: row.timing_label,
            trend: row.tech_trend ? row.tech_trend.replace(/^\d+\.\s*/, '') : null,
            conflict: {
                hasConflict: row.has_conflict === '⚠️ Ya',
                type: row.conflict_type || 'none',
                message: row.conflict_type ? `Conflict: ${row.conflict_type}` : '',
            },
            investorProfile: row.investor_match,
            investorAvoid: row.investor_avoid,
            vqsg: {
                v: row.v_score,
                q: row.q_score,
                s: row.s_score,
                g: row.g_score
            },
            stockProfile: {
                emoji: row.stock_profile_emoji,
                name: row.stock_profile_name,
                description: row.stock_profile_description,
                risk: row.stock_profile_risk
            },
            flexbitDiagnosis: row.flexbit_diagnosis,
            flexbitCategory: row.flexbit_category,
            flexbitStrongest: row.flexbit_strongest,
            flexbitWeakest: row.flexbit_weakest,
            flexbitFundamentalSignal: row.flexbit_fundamental_signal,
            synthesis: {
                profile: row.synthesis_profile,
                description: row.synthesis_description,
                category: row.synthesis_category,
                alignment: row.synthesis_alignment
            },
            dataConfidence: row.data_confidence,
            valuationConfidence: row.valuation_confidence,
            qualityConfidence: row.quality_confidence,
            safetyConfidence: row.safety_confidence,
            growthConfidence: row.growth_confidence,
            safetyNote: row.safety_note,
            qualityFlags: row.quality_flags,
            analystNotes: row.analyst_notes
        },
        technical: {
            lastPrice: row.price ? parseFloat(row.price) : null,
            priceChange: row.price_change ? parseFloat(row.price_change) : null,
            priceChangePercent: row.price_change_pct ? parseFloat(row.price_change_pct) * 100 : null,
            volume: row.volume,
            volumeCategory: row.volume_category,
            week52High: row.week_52_high ? parseFloat(row.week_52_high) : null,
            week52Low: row.week_52_low ? parseFloat(row.week_52_low) : null,
            positionIn52WeekRange: row.position_in_52week_range,
            trend: row.tech_trend ? row.tech_trend.replace(/^\d+\.\s*/, '') : null,
            trendStrength: row.trend_strength,
            lastUpdated: row.updated_at ? new Date(row.updated_at) : new Date(),
            signals: {
                call: row.tech_signal ? row.tech_signal.replace(/^\d+\.\s*/, '') : null,
                entryPrice: row.tech_entry_conservative ? parseFloat(row.tech_entry_conservative) : null,
                tp1: row.tech_tp1 ? parseFloat(row.tech_tp1) : null,
                tp2: row.tech_tp2 ? parseFloat(row.tech_tp2) : null,
                stopLoss: row.tech_stop_loss ? parseFloat(row.tech_stop_loss) : null,
                rsi: row.tech_rsi ? parseFloat(row.tech_rsi) : null,
                rrConservative: row.tech_rr_conservative ? parseFloat(row.tech_rr_conservative) : null
            }
        },
        dividend: {
            yield: row.dividend_yield ? parseFloat(row.dividend_yield) : null,
            payout: row.dividend_payout ? parseFloat(row.dividend_payout) : null,
            exDate: row.dividend_ex_date
        },
        analyst: {
            recommendation: row.analyst_recommendation,
            upsidePct: row.analyst_upside_pct ? parseFloat(row.analyst_upside_pct) : null,
            count: row.analyst_count
        },
        reportDate: row.report_date ? new Date(row.report_date) : null,
    };
}

/**
 * Run the migration from MySQL to MongoDB
 * @param useExistingConnection - If true, assumes mongoose is already connected
 * @returns Object with success count, error count, and total
 */
export async function runMigration(useExistingConnection = false) {
    const startTime = new Date();
    console.log(`\n🚀 [${startTime.toISOString()}] Starting MySQL to MongoDB migration...\n`);

    let mysqlConnection;

    try {
        // Connect to MySQL
        console.log('📦 Connecting to MySQL...');
        mysqlConnection = await mysql.createConnection(mysqlConfig);
        console.log('✅ Connected to MySQL\n');

        // Connect to MongoDB if not already connected
        if (!useExistingConnection) {
            console.log('🍃 Connecting to MongoDB Atlas...');
            await mongoose.connect(process.env.MONGO_URI as string);
            console.log('✅ Connected to MongoDB Atlas\n');
        }

        // Import Stock model dynamically to avoid schema conflicts
        const Stock = mongoose.models.Stock || mongoose.model('Stock', new mongoose.Schema({}, { strict: false }));

        // Fetch all stocks from MySQL
        console.log('📊 Fetching stocks from MySQL...');
        const [rows] = await mysqlConnection.execute('SELECT * FROM daily_fundamentals_update');
        const stocks = rows as any[];
        console.log(`✅ Found ${stocks.length} stocks in MySQL\n`);

        // Transform and upsert to MongoDB
        console.log('🔄 Migrating to MongoDB...');
        let successCount = 0;
        let errorCount = 0;

        for (const row of stocks) {
            try {
                const mongoDoc = transformToMongoDB(row);
                await Stock.findOneAndUpdate(
                    { ticker: mongoDoc.ticker },
                    mongoDoc,
                    { upsert: true, new: true }
                );
                successCount++;
                process.stdout.write(`\r   Processed: ${successCount}/${stocks.length}`);
            } catch (err: any) {
                errorCount++;
                console.error(`\n❌ Error for ${row.ticker}: ${err.message}`);
            }
        }

        const endTime = new Date();
        const duration = ((endTime.getTime() - startTime.getTime()) / 1000).toFixed(2);

        console.log('\n');
        console.log('═'.repeat(50));
        console.log('✅ Migration Complete!');
        console.log('═'.repeat(50));
        console.log(`   Total Stocks: ${stocks.length}`);
        console.log(`   ✅ Success: ${successCount}`);
        console.log(`   ❌ Errors: ${errorCount}`);
        console.log(`   ⏱️  Duration: ${duration}s`);
        console.log('═'.repeat(50));

        return { success: successCount, errors: errorCount, total: stocks.length, duration };

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        // Close MySQL connection
        if (mysqlConnection) {
            await mysqlConnection.end();
        }

        // Close MongoDB connection if we opened it
        if (!useExistingConnection && mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
        }

        console.log('\n🔒 Connections closed.');
    }
}

// Run migration if called directly (manual execution)
if (require.main === module) {
    runMigration().then(() => {
        process.exit(0);
    }).catch((error) => {
        console.error(error);
        process.exit(1);
    });
}
