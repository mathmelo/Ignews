import Stripe from 'stripe';
import packageJson from '../../package.json';

const { version } = packageJson;

export const stripe = new Stripe(
  process.env.API_KEY,
  {
    apiVersion: '2020-08-27',
    appInfo: {
      name: 'Ignews',
      version,
    }
  }
)