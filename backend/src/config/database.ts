import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Load environment variables
config();

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: process.env.NODE_ENV === 'development' ? ':memory:' : 'hackathon-bnpl.db',
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
  entities: [__dirname + '/../entities/*.{ts,js}'],
  migrations: [__dirname + '/../migrations/*.{ts,js}'],
  subscribers: [__dirname + '/../subscribers/*.{ts,js}'],
});

export const initializeDatabase = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('Database connection established');
    }
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};