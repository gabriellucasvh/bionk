import type { Metadata } from "next";
import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import HeaderAjuda from "../../header-ajuda";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const getFilePath = async (slug: string) => {
  const directories = [
    path.join(process.cwd(), "src", "content", "ajuda"),
    path.join(process.cwd(), "src", "content", "ajuda", "guia", "primeiros-passos"),
    path.join(process.cwd(), "src", "content", "ajuda", "guia", "personalizacao"),
    path.join(process.cwd(), "src", "content", "ajuda", "guia", "recursos-avancados")
  ];

  for (const dir of directories) {
    const filePath = path.join(dir, `${slug}.md`);
    try {
      await fs.access(filePath);
      return filePath;
    } catch (error) {
      const err = error as NodeJS.ErrnoException; // Tipo adequado para erros de sistema de arquivos
      // Apenas loga erros que não sejam ENOENT (arquivo não encontrado)
      if (err.code !== "ENOENT") {
        console.error(`Error accessing file in directory ${dir}:`, err);
      }
    }
  }
  throw new Error("Arquivo não encontrado");
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const filePath = await getFilePath(slug);
  const fileContent = await fs.readFile(filePath, "utf8");
  const { data } = matter(fileContent);

  return {
    title: `${data.title} | Bionk Ajuda`,
    description: data.description,
  };
}

export async function generateStaticParams() {
  const directory = path.join(process.cwd(), "src", "content", "ajuda", "guia");

  let filenames: string[] = [];
  try {
    filenames = await fs.readdir(directory);
  } catch {
    console.error("Erro ao acessar o diretório de guias.");
  }

  return filenames
    .filter((filename) => filename.endsWith(".md")) // Garante que são arquivos válidos
    .map((filename) => ({
      slug: filename.replace(/\.md$/, ""),
    }));
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const filePath = await getFilePath(slug);
  const fileContent = await fs.readFile(filePath, "utf8");
  const { data, content } = matter(fileContent);

  return (
    <main>
      <HeaderAjuda />
      <div className="container mx-auto lg:px-22 my-12 p-4">
        <header className="mb-10 border-b pb-4 space-y-3">
          <h1 className="text-3xl font-bold">{data.title}</h1>
          <p className="text-muted-foreground">{data.description}</p>
          <span className="text-muted-foreground">
            Categoria:{" "}
            <Link href="/ajuda" className="text-blue-500 hover:underline">
              {data.category}
            </Link>
          </span>
        </header>
        <article className="prose">
          <ReactMarkdown>{content}</ReactMarkdown>
        </article>
        <div className="mt-10">
          <Link
            href="/ajuda"
            className="flex w-fit items-center p-2 text-white rounded-lg text-sm bg-green-600 hover:bg-green-700"
          >
            <ArrowLeft className="mr-2" />
            <span>Voltar à Central de Ajuda</span>
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
