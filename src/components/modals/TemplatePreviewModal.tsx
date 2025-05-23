'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, Globe, LinkIcon, Share2 } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  image: string; 
}

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  template: Template | null;
}

const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({ isOpen, onOpenChange, template }) => {
  if (!template) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[90vw] sm:max-w-lg rounded-2xl border bg-background p-0 shadow-xl">
        <div className="flex justify-center p-6 pb-2">
          <Image src="/bionk-logo.svg" alt="Bionk Logo" width={64} height={64} className="sm:w-20 sm:h-20" />
        </div>

        <DialogHeader className="px-4 sm:px-6 pt-2">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-center">
            Junte-se ao Bionk
          </DialogTitle>
          <DialogDescription className="text-center text-sm sm:text-base">
            Crie sua página, compartilhe seus links e conecte-se com o mundo.
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 sm:px-6 py-4">
          <Separator className="my-2" />

          <div className="grid grid-cols-1 gap-4 py-4">
            {[
              {
                icon: <Globe className="w-4 h-4" />,
                title: 'Sua presença online',
                desc: 'Crie um perfil único que represente você ou sua marca.',
                bg: 'bg-blue-100 text-blue-600'
              },
              {
                icon: <LinkIcon className="w-4 h-4" />,
                title: 'Todos os seus links',
                desc: 'Reúna todos os seus conteúdos em um só lugar.',
                bg: 'bg-purple-100 text-purple-600'
              },
              {
                icon: <Share2 className="w-4 h-4" />,
                title: 'Compartilhe facilmente',
                desc: 'Compartilhe seu perfil em qualquer lugar com um único link.',
                bg: 'bg-green-100 text-green-600'
              }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${item.bg}`}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-medium text-base sm:text-lg">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <p className="text-sm sm:text-base text-center text-muted-foreground mt-4">
            Junte-se a milhares de criadores que já estão usando o <strong>Bionk</strong> para expandir sua presença online.
          </p>
        </div>

        <DialogFooter className="flex flex-col p-4 sm:p-6 pt-2">
          <Link className="w-full text-center inline-flex items-center justify-center rounded-md px-3 py-2 bg-gradient-to-r from-lime-500 to-emerald-600 hover:from-green-600 hover:to-green-700 text-white font-medium transition-colors duration-300" href="https://www.bionk.me/registro" rel="noopener noreferrer" target="_blank">
            Começar agora
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TemplatePreviewModal;
