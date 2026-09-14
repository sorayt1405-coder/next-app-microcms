import Link from 'next/link';
import { client } from '../libs/client';

export default async function Home() {
  const data = await client.get({
    endpoint: 'blog',
  });

  return (
    <main>
      <h1>ブログ一覧</h1>

      {data.contents.map((blog: any) => (
        <article key={blog.id}>
          <h2>
            <Link href={`/blog/${blog.slug}`}>
              {blog.title}
            </Link>
          </h2>
        </article>
      ))}
    </main>
  );
}