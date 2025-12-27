/**
 * @file migrateFromNews.ts
 * @description Manual migration script to fetch News from MySQL and upsert to MongoDB.
 * 
 * Run with: npx ts-node src/scripts/migrateFromNews.ts
 * 
 * Environment Variables Required:
 *   MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE
 *   MONGO_URI
 */

import mongoose from 'mongoose';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import News from '../models/News';

dotenv.config();

// MySQL Configuration
const mysqlConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
};

interface MySQLNewsRow {
    id: number;
    headline: string;
    content: string;
    date: string; // Typically returns as Date object or string from driver, safe to assume string for now
    image: string;
}

export const migrateNews = async () => {
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

        // Fetch News from MySQL
        console.log('📥 Fetching News from MySQL...');
        const [rows] = await mysqlConnection.execute('SELECT * FROM news ORDER BY date DESC');
        const newsList = rows as MySQLNewsRow[];

        console.log(`📊 Found ${newsList.length} News items to migrate`);

        if (newsList.length === 0) {
            console.log('⚠️ No News found in MySQL.');
            return { success: 0, total: 0 };
        }

        // Transform and upsert
        let migratedCount = 0;
        for (const newsItem of newsList) {
            const transformedNews = {
                id: newsItem.id,
                headline: newsItem.headline,
                content: newsItem.content,
                date: new Date(newsItem.date),
                image: newsItem.image
            };

            await News.findOneAndUpdate(
                { id: newsItem.id }, // Use ID as unique identifier
                transformedNews,
                { upsert: true, new: true }
            );
            migratedCount++;
        }

        console.log(`\n✅ Successfully migrated ${migratedCount} News items to MongoDB!`);
        return { success: migratedCount, total: newsList.length };

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        if (mysqlConnection) {
            await mysqlConnection.end();
            console.log('🔌 MySQL connection closed');
        }
    }
};

// Only run if called directly
if (require.main === module) {
    migrateNews().then(() => {
        mongoose.connection.close();
        console.log('🔌 MongoDB connection closed');
    }).catch(() => {
        process.exit(1);
    });
}

export default migrateNews;
