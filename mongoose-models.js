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
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  pageLink: {
    type: String,
    required: true
  },
  imageLink: {
    type: String,
    required: true
  }
});

const domainSchema = new mongoose.Schema({
  domain: {
    type: String,
    required: true,
    unique: true
  },
  products: [productSchema],
  lastScraped: {
    type: Date,
    default: Date.now
  },
  data: {
    type: String,
    required: true
  }
});

export const Domain = mongoose.model('Domain', domainSchema);

export const ScrapedDomain = mongoose.model('ScrapedDomain', scrapedDomainSchema);