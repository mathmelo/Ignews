import Head from "next/head";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { GetStaticProps, GetStaticPaths } from "next";
import { asHTML } from "@prismicio/helpers";
import { createClient } from "../../../services/prismicio";

import styles from '../post.module.scss';
import Link from "next/link";

interface IPreviewProps {
  post: {
    slug: string,
    title: string,
    content: string,
    updatedAt: string
  }
}

const Preview: React.FC = ({ post }: IPreviewProps) => {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if(session?.activeSubscription) {
      router.push(`/posts/${post.slug}`);
    }
  }, [session])

  return (
    <>
      <Head>
        <title>{post.title} | ig.news</title>
      </Head>

      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>
          <div 
            className={`${styles.postContent} ${styles.previewContent}`}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className={styles.continueReading}>
            Wanna continue reading?
            <Link href="/">
              <a>Subscribe</a>
            </Link>
            🤗
          </div>
        </article>
      </main>

    </>
  );
}

export default Preview;

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismicClient = createClient();

  const response = await prismicClient.getByUID('publication', String(slug), {});

  const post = {
    slug,
    title: response.data.title,
    content: asHTML(response.data.content.splice(0, 3)),
    updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  return {
    props: {
      post
    },
    revalidate: 60 * 30, // 30 minutes
  }
}