import { linkResolver, createClient } from '../../services/prismicio';
import { setPreviewData, redirectToPreviewURL } from '@prismicio/next';
import { NextApiRequest, NextApiResponse } from 'next';

const preview = async (req: NextApiRequest, res: NextApiResponse) => {

  if(!req.query.access || req.query.access !== process.env.PRISMIC_PREVIEW_TOKEN) {
    res.status(401).json({ message: 'Invalid token' });
  }

  const client = createClient({ req });
  await setPreviewData({ req, res });
  await redirectToPreviewURL({ req, res, client, linkResolver });
}

export default preview;