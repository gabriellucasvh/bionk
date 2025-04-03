"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

type LinkItem = {
  id: number;
  title: string;
  url: string;
  active: boolean;
};

interface ArchivedLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ArchivedLinksModal = ({ isOpen, onClose }: ArchivedLinksModalProps) => {
  const { data: session } = useSession();
  const [archivedLinks, setArchivedLinks] = useState<LinkItem[]>([]);

  useEffect(() => {
    if (isOpen && session?.user?.id) {
      const fetchArchivedLinks = async () => {
        const res = await fetch(
          `/api/links?userId=${session.user.id}&active=false`
        );
        const data = await res.json();
        setArchivedLinks(data.links || []);
      };
      fetchArchivedLinks();
    }
  }, [isOpen, session]);

  const restoreLink = async (id: number) => {
    const res = await fetch(`/api/links/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: true }),
    });
    if (res.ok) {
      setArchivedLinks(archivedLinks.filter((link) => link.id !== id));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-50">
      <section className="bg-white rounded-lg shadow-lg w-11/12 max-w-md">
        <header className="px-4 py-2 border-b">
          <h2 className="text-xl font-bold">Links Arquivados</h2>
        </header>
        <main className="p-4 space-y-4 max-h-80 overflow-y-auto">
          {archivedLinks.length === 0 ? (
            <p>Nenhum link arquivado.</p>
          ) : (
            <ul className="space-y-2">
              {archivedLinks.map((link) => (
                <li
                  key={link.id}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div>
                    <p className="font-medium">{link.title}</p>
                    <p className="text-sm text-blue-500">{link.url}</p>
                  </div>
                  <Button className="bg-green-500 hover:bg-green-600" onClick={() => restoreLink(link.id)}>Restaurar</Button>
                </li>
              ))}
            </ul>
          )}
        </main>
        <footer className="px-4 py-2 border-t flex justify-end">
          <Button onClick={onClose}>Fechar</Button>
        </footer>
      </section>
    </div>
  );
};

export default ArchivedLinksModal;
