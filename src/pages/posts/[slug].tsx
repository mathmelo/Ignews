import Head from "next/head";
import { GetServerSideProps } from "next";
import { getSession } from 'next-auth/react';
import { asHTML } from "@prismicio/helpers";
import { createClient } from "../../services/prismicio";

import styles from './post.module.scss';

interface IPostsProps {
  post: {
    slug: string,
    title: string,
    content: string,
    updatedAt: string
  }
}

const Posts: React.FC = ({ post }: IPostsProps) => {
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
            className={styles.postContent}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </main>

    </>
  );
}

export default Posts;

export const getServerSideProps: GetServerSideProps = async ({ req, params }) => {
  const session = await getSession({ req });
  const { slug } = params;

  if(!session || !session?.activeSubscription) {
    return {
      redirect: {
        destination: `/posts/preview/${slug}`,
        permanent: false
      }
    }
  }


  const prismicClient = createClient(req);

  const response = await prismicClient.getByUID('publication', String(slug), {});

  const post = {
    slug,
    title: response.data.title,
    content: asHTML(response.data.content),
    updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  return {
    props: {
      post
    }
  }
}