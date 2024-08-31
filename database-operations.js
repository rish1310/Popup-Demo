import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ScrapedDomain } from './mongoose-models.js';

dotenv.config();

const uri = process.env.MONGODB_URI;

export async function connectToDatabase() {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB using Mongoose');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

// Helper function to normalize domain names
function normalizeDomain(domain) {
  return domain.replace(/^www\./, '');
}

export async function checkDomainScraped(domain) {
  const normalizedDomain = normalizeDomain(domain);
  const result = await ScrapedDomain.findOne({ domain: normalizedDomain });
  return result !== null;
}

export async function saveDomainData(domain, data) {
  const normalizedDomain = normalizeDomain(domain);
  await ScrapedDomain.findOneAndUpdate(
    { domain: normalizedDomain },
    { data, lastScraped: new Date() },
    { upsert: true, new: true }
  );
}

export async function getDomainData(domain) {
  const normalizedDomain = normalizeDomain(domain);
  const result = await ScrapedDomain.findOne({ domain: normalizedDomain });
  return result ? result.data : null;
}

export async function closeDatabaseConnection() {
  await mongoose.connection.close();
  console.log('Closed MongoDB connection');
}
