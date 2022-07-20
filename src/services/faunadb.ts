import { Client } from 'faunadb';

const secret = process.env.FAUNA_KEY;
const endpoint = process.env.FAUNA_URL || 'db.us.fauna.com';

if(!secret) {
  console.error('FAUNADB secret environment variable is not set, exiting.');

  process.exit(1);
}

export const fauna = new Client({ 
  secret,
  domain: endpoint,
  port: 443,
  scheme: 'https',
 })


