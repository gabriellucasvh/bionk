import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Fuse from 'fuse.js';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  const directories = [
    path.join(process.cwd(), 'src', 'content', 'ajuda', 'guia', 'personalizacao'),
    path.join(process.cwd(), 'src', 'content', 'ajuda', 'guia', 'primeiros-passos'),
    path.join(process.cwd(), 'src', 'content', 'ajuda', 'guia', 'recursos-avancados'),
  ];

  const guides: Array<{ slug: string; title: string; description: string; type: string }> = [];

  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) return; 

    const files = fs.readdirSync(dir).filter((filename) => {
      const filePath = path.join(dir, filename);
      return fs.statSync(filePath).isFile() && filename.endsWith('.md');
    });

    files.forEach((filename) => {
      const filePath = path.join(dir, filename);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContent);
      guides.push({
        slug: filename.replace('.md', ''),
        title: data.title || 'Sem título',
        description: data.description || '',
        type: data.type || '',
      });
    });
  });

  const fuse = new Fuse(guides, {
    keys: ['title', 'description', 'type'],
    includeScore: true,
  });

  const results = query ? fuse.search(query).map(result => result.item) : guides;

  return NextResponse.json(results);
}
