import type { Metadata } from "next";
import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import HeaderAjuda from '../../header-ajuda';
import FooterAjuda from '../../footer-ajuda';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const getFilePath = async (slug: string) => {
  const directories = [
    path.join(process.cwd(), 'src', 'content', 'ajuda'),
    path.join(process.cwd(), 'src', 'content', 'ajuda', 'primeiros-passos')
  ];

  for (const dir of directories) {
    const filePath = path.join(dir, `${slug}.md`);
    try {
      await fs.access(filePath);
      return filePath;
    } catch (error) {
      continue;
    }
  }
  throw new Error('Arquivo não encontrado');
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const filePath = await getFilePath(slug);
  const fileContent = await fs.readFile(filePath, "utf8");
  const { data } = matter(fileContent);
  
  return {
    title: data.title + " | Bionk Ajuda",
    description: data.description,
  };
}

export async function generateStaticParams() {
  const directories = [
    path.join(process.cwd(), 'src', 'content', 'ajuda'),
    path.join(process.cwd(), 'src', 'content', 'ajuda', 'primeiros-passos')
  ];

  let filenames: string[] = [];
  for (const dir of directories) {
    try {
      const files = await fs.readdir(dir);
      filenames = filenames.concat(files);
    } catch (error) {
      continue;
    }
  }

  return filenames.map((filename) => ({
    slug: filename.replace(/\.md$/, ''),
  }));
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const filePath = await getFilePath(slug);
  const fileContent = await fs.readFile(filePath, 'utf8');
  const { data, content } = matter(fileContent);

  return (
    <main>
      <HeaderAjuda />
      <div className="container mx-auto lg:px-22 my-12 p-4">
        <header className="mb-10 border-b pb-4 space-y-3">
          <h1 className="text-4xl font-bold">{data.title}</h1>
          <p className='text-muted-foreground'>{data.description}</p>
          <span className='text-muted-foreground'>Categoria: <Link href="/ajuda" className="text-blue-500 hover:underline">{data.category}</Link></span>
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
