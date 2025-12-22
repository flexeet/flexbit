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
    question: string;
    answer: string;
    category_id: number;
    difficulty_level: string;
    is_popular: number;
    view_count: number;
    helpful_count: number;
    tags: string;
    display_order: number;
    is_active: number;
    created_at: string;
    updated_at: string;
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
        const [rows] = await mysqlConnection.execute('SELECT * FROM wiki_faq WHERE is_active = 1 ORDER BY display_order ASC');
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
                categoryId: faq.category_id,
                difficultyLevel: faq.difficulty_level as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
                isPopular: faq.is_popular === 1,
                viewCount: faq.view_count,
                helpfulCount: faq.helpful_count,
                tags: faq.tags ? faq.tags.split(',').map(t => t.trim()) : [],
                displayOrder: faq.display_order,
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
