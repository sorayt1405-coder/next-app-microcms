import { client } from '../../../libs/client';

type HeadingBlock = {
    fieldId: 'HeadingBlock';
    level: string[];
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
        description?: string;
        thumbnail?: {
            url: string;
            width: number;
            height: number;
        };
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
    type: string[];
    title?: string;
    body: string;
};

export default async function BlogPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ draftKey?: string }>;
}) {
    const { slug } = await params;
    const { draftKey } = await searchParams;

    let blog: Blog | undefined;

    if (draftKey) {
        blog = await client.getListDetail<Blog>({
            endpoint: 'blog',
            contentId: slug,
            queries: {
                draftKey,
            },
        });
    } else {
        const data = await client.getList<Blog>({
            endpoint: 'blog',
            queries: {
                filters: `slug[equals]${slug}`,
            },
        });

        blog = data.contents[0];
    }

    if (!blog) {
        return <div>記事が見つかりませんでした。</div>;
    }

    return (
        <main className="blog-detail">
            <h1 className="blog-title">{blog.title}</h1>

            <div className="blog-content">
                {blog.contents.map((block, index) => {
                    if (block.fieldId === 'HeadingBlock') {
                        if (block.level?.includes('h2')) {
                            return <h2 key={index}>{block.text}</h2>;
                        }

                        if (block.level?.includes('h3')) {
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
                            <figure key={index} className="blog-image">
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
                            <blockquote key={index} className="quote-box">
                                <div
                                    className="quote-box-body"
                                    dangerouslySetInnerHTML={{ __html: block.body }}
                                />

                                {block.source && (
                                    <cite className="quote-box-source">
                                        {block.source}
                                    </cite>
                                )}
                            </blockquote>
                        );
                    }

                    if (block.fieldId === 'InfoBoxBlock') {
                        const boxType = block.type?.[0]?.toLowerCase() || 'memo';

                        return (
                            <div
                                key={index}
                                className={`info-box info-box-${boxType}`}
                            >
                                {boxType !== 'note' && block.title && (
                                    <div className="info-box-title">
                                        {block.title}
                                    </div>
                                )}

                                <div
                                    className="info-box-body"
                                    dangerouslySetInnerHTML={{ __html: block.body }}
                                />
                            </div>
                        );
                    }

                    if (block.fieldId === 'GalleryBlock') {
                        return (
                            <div key={index} className="blog-gallery">
                                {block.GalleryBlock.map((item, itemIndex) => (
                                    <figure key={itemIndex} className="blog-gallery-item">
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
                            const article = block.internalArticle;

                            return (
                                <a
                                    key={index}
                                    href={`/blog/${article.slug}`}
                                    className="blog-card"
                                >
                                    <div className="blog-card-content">
                                        <div className="blog-card-title">
                                            {article.title}
                                        </div>

                                        {article.description && (
                                            <p className="blog-card-description">
                                                {article.description}
                                            </p>
                                        )}
                                    </div>

                                    {article.thumbnail && (
                                        <div className="blog-card-image">
                                            <img
                                                src={article.thumbnail.url}
                                                alt=""
                                                width={article.thumbnail.width}
                                                height={article.thumbnail.height}
                                            />
                                        </div>
                                    )}
                                </a>
                            );
                        }

                        if (block.externalUrl) {
                            return (
                                <a
                                    key={index}
                                    href={block.externalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="blog-card blog-card-external"
                                >
                                    <div className="blog-card-content">
                                        <div className="blog-card-title">
                                            {block.externalUrl}
                                        </div>
                                    </div>
                                </a>
                            );
                        }
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
                })}
            </div>
        </main>
    );
}