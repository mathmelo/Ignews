import * as prismic from '@prismicio/client';
import { enableAutoPreviews, CreateClientConfig } from '@prismicio/next';

import sm from '../../sm.json';

const endpoint = sm.apiEndpoint;
export const repositoryName = prismic.getRepositoryName(endpoint);

export function linkResolver(doc) {
  switch (doc.type) {
    case 'publication':
      return `/posts/${doc.uid}`;
    default:
      return null;
  }
}

export function createClient(config = {}) {
  const client = prismic.createClient(endpoint, {
    ...config,
    accessToken: process.env.PRISMIC_ACCESS_TOKEN
  });

  const configWithType = config as CreateClientConfig;

  enableAutoPreviews({
    client,
    previewData: configWithType.previewData,
    req: configWithType.req,
  });

  return client;
}