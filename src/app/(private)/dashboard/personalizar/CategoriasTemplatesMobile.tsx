// src/app/(private)/dashboard/personalizar/CategoriasTemplatesMobile.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface TemplateItem {
  id: string;
  name: string;
  image: string;
}

interface CategoryData {
  [key: string]: TemplateItem[];
}

interface CategoriasTemplatesMobileProps {
  categories: CategoryData;
  currentTemplate: { template: string; templateCategory: string } | null;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  selectedTemplate: string | null;
  setSelectedTemplate: (templateId: string | null) => void;
  handleSave: () => Promise<void>;
  isSaving: boolean;
  renderContentForModal: () => JSX.Element;
}

export default function CategoriasTemplatesMobile({
  categories,
  currentTemplate,
  selectedCategory,
  selectedTemplate,
  handleSave,
  isSaving,
  renderContentForModal,
}: CategoriasTemplatesMobileProps) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  return (
    <>
      {/* Botão para abrir o modal em telas pequenas */}
      <div className="md:hidden mb-6 relative z-40">
        <Button
          onClick={() => setIsModalOpen(true)}
          className="py-3 px-10 border-2 bg-green-950 text-white border-lime-500"
        >
          Templates
        </Button>
      </div>

      {/* Modal para telas pequenas */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-2 sm:p-4 md:hidden">
          <div className="bg-card p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-xs sm:max-w-md relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 sm:top-3 sm:right-3 text-muted-foreground hover:text-foreground z-10"
            >
              <X size={20} />
            </Button>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-center">Escolha seu Template</h2>

            {currentTemplate && (
              <div className="mb-3 sm:mb-4 text-center">
                <span className="bg-green-100 text-green-800 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-medium block sm:inline-block">
                  Atual: {currentTemplate.templateCategory.charAt(0).toUpperCase() + currentTemplate.templateCategory.slice(1)} - {
                    categories[currentTemplate.templateCategory as keyof typeof categories]
                      ?.find(t => t.id === currentTemplate.template)?.name || currentTemplate.template
                  }
                </span>
              </div>
            )}

            <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-4">
              {renderContentForModal()}
            </div>

            {selectedCategory && (
                <Button
                    onClick={async () => {
                        await handleSave();
                        setIsModalOpen(false); 
                    }}
                    className="mt-4 w-full py-2 rounded-lg text-white bg-green-600 hover:bg-green-700"
                    disabled={!selectedTemplate || isSaving}
                >
                    {isSaving ? "Salvando..." : "Salvar Template"}
                </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
}