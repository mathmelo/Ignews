import { AppProps } from 'next/app';
import Link from 'next/link';
import { SessionProvider } from 'next-auth/react';
import { PrismicProvider } from '@prismicio/react';
import { PrismicPreview } from '@prismicio/next';

import { repositoryName, linkResolver } from '../services/prismicio';

import '../styles/global.scss';
import { Header } from '../components/Header';

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <PrismicProvider
          linkResolver={linkResolver}
          internalLinkComponent={({ href, children, ...props }) => (
            <Link href={href}>
              <a {...props}>
                {children}
              </a>
            </Link>
          )}
        >
          <PrismicPreview repositoryName={repositoryName}>
            <Header />
            <Component {...pageProps} />
          </PrismicPreview>
        </PrismicProvider>
    </SessionProvider>
  )
}

export default MyApp
