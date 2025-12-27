/**
 * @file migrateFromWiki.ts
 * @description Manual migration script to fetch Wikis from MySQL and upsert to MongoDB.
 * 
 * Run with: npx ts-node src/scripts/migrateFromWiki.ts
 * 
 * Environment Variables Required:
 *   MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE
 *   MONGO_URI
 */

import mongoose from 'mongoose';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import Wiki from '../models/Wiki';

dotenv.config();

// MySQL Configuration
const mysqlConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
};

interface MySQLWikiRow {
    id: number;
    field_name: string;
    field_category: string;
    what_is_it: string;
    score_min: string | null;
    score_max: string | null;
    range_label: string;
    range_emoji: string;
    range_description: string;
    actionable_insight: string;
    display_order: number;
}

export const migrateWikis = async () => {
    let mysqlConnection;

    try {
        // Only connect to MongoDB if not already connected (for scheduler usage)
        if (mongoose.connection.readyState === 0) {
            console.log('🔗 Connecting to MongoDB...');
            await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/flexbit');
            console.log('✅ MongoDB connected');
        }

        // Connect to MySQL
        console.log('🔗 Connecting to MySQL...');
        mysqlConnection = await mysql.createConnection(mysqlConfig);
        console.log('✅ MySQL connected');

        // Fetch Wikis from MySQL
        console.log('📥 Fetching Wikis from MySQL...');
        const [rows] = await mysqlConnection.execute('SELECT * FROM wiki ORDER BY display_order ASC');
        const wikis = rows as MySQLWikiRow[];

        console.log(`📊 Found ${wikis.length} Wikis to migrate`);

        if (wikis.length === 0) {
            console.log('⚠️ No Wikis found in MySQL.');
            return { success: 0, total: 0 };
        }

        // Transform and upsert
        let migratedCount = 0;
        for (const wiki of wikis) {
            const transformedWiki = {
                id: wiki.id,
                fieldName: wiki.field_name,
                fieldCategory: wiki.field_category,
                whatIsIt: wiki.what_is_it,
                scoreMin: wiki.score_min ? parseFloat(wiki.score_min) : null,
                scoreMax: wiki.score_max ? parseFloat(wiki.score_max) : null,
                rangeLabel: wiki.range_label,
                rangeEmoji: wiki.range_emoji,
                rangeDescription: wiki.range_description,
                actionableInsight: wiki.actionable_insight,
                displayOrder: wiki.display_order
            };

            await Wiki.findOneAndUpdate(
                { id: wiki.id }, // Use ID as unique identifier
                transformedWiki,
                { upsert: true, new: true }
            );
            migratedCount++;
        }

        console.log(`\n✅ Successfully migrated ${migratedCount} Wikis to MongoDB!`);
        return { success: migratedCount, total: wikis.length };

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        if (mysqlConnection) {
            await mysqlConnection.end();
            console.log('🔌 MySQL connection closed');
        }
        // Do not close MongoDB connection here if it's being used by scheduler
    }
};

// Only run if called directly
if (require.main === module) {
    migrateWikis().then(() => {
        mongoose.connection.close();
        console.log('🔌 MongoDB connection closed');
    }).catch(() => {
        process.exit(1);
    });
}

export default migrateWikis;
