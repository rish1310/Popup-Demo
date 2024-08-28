import mongoose from 'mongoose';

const scrapedDomainSchema = new mongoose.Schema({
  domain: {
    type: String,
    required: true,
    unique: true
  },
  data: {
    type: String,
    required: true
  },
  lastScraped: {
    type: Date,
    default: Date.now
  }
});

export const ScrapedDomain = mongoose.model('ScrapedDomain', scrapedDomainSchema);