/**
 * @file migrateFromFaqs.ts
 * @description Manual migration script to fetch FAQs from MySQL and upsert to MongoDB.
 * 
 * Run with: npx ts-node src/scripts/migrateFromFaqs.ts
 * 
 * Environment Variables Required:
 *   MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE
 *   MONGO_URI
 */

import mongoose from 'mongoose';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import Faq from '../models/Faq';

dotenv.config();

// MySQL Configuration
const mysqlConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
};

interface MySQLFaqRow {
    id: number;
    category: string;
    question: string;
    answer: string;
    note: string | null;
    is_active: number;
}

const migrateFaqs = async () => {
    let mysqlConnection;

    try {
        // Connect to MongoDB
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/flexbit');
        console.log('✅ MongoDB connected');

        // Connect to MySQL
        console.log('🔗 Connecting to MySQL...');
        mysqlConnection = await mysql.createConnection(mysqlConfig);
        console.log('✅ MySQL connected');

        // Fetch FAQs from MySQL
        console.log('📥 Fetching FAQs from MySQL...');
        const [rows] = await mysqlConnection.execute('SELECT * FROM wiki_faq_news WHERE is_active = 1');
        const faqs = rows as MySQLFaqRow[];

        console.log(`📊 Found ${faqs.length} FAQs to migrate`);

        if (faqs.length === 0) {
            console.log('⚠️ No FAQs found in MySQL. Exiting.');
            return;
        }

        // Transform and upsert
        let migratedCount = 0;
        for (const faq of faqs) {
            const transformedFaq = {
                question: faq.question,
                answer: faq.answer,
                category: faq.category,
                note: faq.note || undefined, // Convert null to undefined
                isActive: faq.is_active === 1
            };

            await Faq.findOneAndUpdate(
                { question: faq.question }, // Use question as unique identifier
                transformedFaq,
                { upsert: true, new: true }
            );
            migratedCount++;
            process.stdout.write(`\r🔄 Migrating... ${migratedCount}/${faqs.length}`);
        }

        console.log(`\n✅ Successfully migrated ${migratedCount} FAQs to MongoDB!`);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        if (mysqlConnection) {
            await mysqlConnection.end();
            console.log('🔌 MySQL connection closed');
        }
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed');
    }
};

// Run migration
migrateFaqs();
