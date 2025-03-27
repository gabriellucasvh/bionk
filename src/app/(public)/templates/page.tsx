import type { Metadata } from 'next';
import React from 'react'
import TemplatesClient from './templates.client'

export const metadata: Metadata = {
    title: "Bionk | Templates",
    description: "Escolha entre diversos templates para sua página de links. Design profissional em 1 clique - encontre o estilo perfeito para seu perfil!",
};

const Templates = () => {
    return (
        <div><TemplatesClient /></div>
    )
}

export default Templates