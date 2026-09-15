import { client } from '../../../libs/client';

type HeadingBlock = {
    fieldId: 'HeadingBlock';
    level: string;
    text: string;
};

type TextBlock = {
    fieldId: 'TextBlock';
    body: string;
};

type ImageBlock = {
    fieldId: 'ImageBlock';
    image: {
        url: string;
        width: number;
        height: number;
    };
    caption?: string;
};

type QuoteBlock = {
    fieldId: 'QuoteBlock';
    body: string;
    source?: string;
};

type GalleryImage = {
    fieldId: 'GalleryImage';
    image: {
        url: string;
        width: number;
        height: number;
    };
    caption?: string;
};

type GalleryBlock = {
    fieldId: 'GalleryBlock';
    GalleryBlock: GalleryImage[];
};

type LinkCardBlock = {
    fieldId: 'LinkCardBlock';
    internalArticle?: {
        id: string;
        title: string;
        slug: string;
    };
    externalUrl?: string;
};

type Blog = {
    id: string;
    title: string;
    slug: string;
    contents: (
        | HeadingBlock
        | TextBlock
        | ImageBlock
        | QuoteBlock
        | InfoBoxBlock
        | GalleryBlock
        | LinkCardBlock
    )[];

};

type InfoBoxBlock = {
    fieldId: 'InfoBoxBlock';
    type: string;
    body: string;
};

export default async function BlogPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const data = await client.getList<Blog>({
        endpoint: 'blog',
        queries: {
            filters: `slug[equals]${slug}`,
        },
    });

    const blog = data.contents[0];

    if (!blog) {
        return <div>記事が見つかりませんでした。</div>;
    }

    return (
        <main>
            <h1>{blog.title}</h1>

            {blog.contents.map((block, index) => {
                if (block.fieldId === 'HeadingBlock') {
                    if (block.level === 'h2') {
                        return <h2 key={index}>{block.text}</h2>;
                    }

                    if (block.level === 'h3') {
                        return <h3 key={index}>{block.text}</h3>;
                    }

                    return <h2 key={index}>{block.text}</h2>;
                }

                if (block.fieldId === 'TextBlock') {
                    return (
                        <div
                            key={index}
                            dangerouslySetInnerHTML={{ __html: block.body }}
                        />
                    );
                }

                if (block.fieldId === 'ImageBlock') {
                    return (
                        <figure key={index}>
                            <img
                                src={block.image.url}
                                alt={block.caption ?? ''}
                                width={block.image.width}
                                height={block.image.height}
                            />

                            {block.caption && (
                                <figcaption>{block.caption}</figcaption>
                            )}
                        </figure>
                    );
                }

                if (block.fieldId === 'QuoteBlock') {
                    return (
                        <blockquote key={index}>
                            <div
                                dangerouslySetInnerHTML={{ __html: block.body }}
                            />

                            {block.source && (
                                <cite>{block.source}</cite>
                            )}
                        </blockquote>
                    );
                }

                if (block.fieldId === 'InfoBoxBlock') {
                    return (
                        <div key={index} data-type={block.type}>
                            <div
                                dangerouslySetInnerHTML={{ __html: block.body }}
                            />
                        </div>
                    );
                }

                if (block.fieldId === 'GalleryBlock') {
                    return (
                        <div key={index}>
                            {block.GalleryBlock.map((item, itemIndex) => (
                                <figure key={itemIndex}>
                                    <img
                                        src={item.image.url}
                                        alt={item.caption ?? ''}
                                        width={item.image.width}
                                        height={item.image.height}
                                    />

                                    {item.caption && (
                                        <figcaption>{item.caption}</figcaption>
                                    )}
                                </figure>
                            ))}
                        </div>
                    );
                }

                if (block.fieldId === 'LinkCardBlock') {
                    if (block.internalArticle) {
                        return (
                            <div key={index}>
                                <a href={`/blog/${block.internalArticle.slug}`}>
                                    {block.internalArticle.title}
                                </a>
                            </div>
                        );
                    }

                    if (block.externalUrl) {
                        return (
                            <div key={index}>
                                <a
                                    href={block.externalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {block.externalUrl}
                                </a>
                            </div>
                        );
                    }

                    return null;
                }

                return null;
            })}
        </main>
    );
}