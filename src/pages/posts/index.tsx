import Head from 'next/head';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import { createClient } from '../../services/prismicio';

import styles from './styles.module.scss';

interface IPostProps {
  posts: {
    slug: string
    title: string
    excerpt: string
    updatedAt: string
  }[]
}

export default function Posts({ posts }: IPostProps) {
  return (
    <>
      <Head>
        <title>Posts | ig.news</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.postList}>
          {posts.map(post => (
            <Link href={`/posts/${post.slug}`} key={post.slug}>
              <a>
                <time>{post.updatedAt}</time>
                <strong>{post.title}</strong>
                <p>{post.excerpt}</p>
              </a>
            </Link>
          ))}
        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const client = createClient();

  const response = await client.getByType('publication', {
    pageSize: 100,
    fetch: ['title', 'content']
  });

  const posts = response.results.map(post => {
    return {
      slug: post.uid,
      title: post.data.title,
      excerpt: post.data.content.find(item => item.type === 'paragraph')?.text ?? '',
      updatedAt: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    };
  })

  return {
    props: {
      posts
    },
    revalidate: 60 * 30, // 30 minutes
  }
}