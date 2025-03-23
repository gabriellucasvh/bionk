{/* src/app/(public)/ajuda/[slug]/page.tsx */ }
import type { Metadata } from "next";
import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import HeaderAjuda from '../header-ajuda';
import FooterAjuda from '../footer-ajuda';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = params;
  const filePath = path.join(process.cwd(), "src", "content", "ajuda", `${slug}.md`);
  const fileContent = await fs.readFile(filePath, "utf8");
  const { data } = matter(fileContent);
  
  return {
    title: data.title + " | Bionk Ajuda",
    description: data.description,
  };
}

export async function generateStaticParams() {
  const articlesDirectory = path.join(process.cwd(), 'src', 'content', 'ajuda');
  const filenames = await fs.readdir(articlesDirectory);
  return filenames.map((filename) => ({
    slug: filename.replace(/\.md$/, ''),
  }));
}

interface PageProps {
  params: { slug: string };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = params;
  const filePath = path.join(process.cwd(), 'src', 'content', 'ajuda', `${slug}.md`);
  const fileContent = await fs.readFile(filePath, 'utf8');
  const { data, content } = matter(fileContent);

  return (

    <main>
      <HeaderAjuda />
      <div className="container mx-auto lg:mx-22 my-12 p-4">
        <header className="mb-10 border-b pb-4 space-y-3">
          <h1 className="text-4xl font-bold">{data.title}</h1>
          <p className='text-muted-foreground'>{data.description}</p>
          <span className='text-muted-foreground'>Categoria: {data.category}</span>
        </header>
        <article className="prose">
          <ReactMarkdown>{content}</ReactMarkdown>
        </article>
        <div className='mt-4'>
          <Link href="/ajuda" className="text-blue-500 hover:underline">
            Voltar à Central de Ajuda
          </Link>
        </div>
      </div>
      <FooterAjuda />
    </main>
  );
}
