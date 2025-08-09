import type { Metadata } from 'next'
import Sidebar from '../dashboard.sidebar'
import IframePreview from './components/personalizar.IFramePreview'
import PersonalizarClient from './personalizar.client'

export const metadata: Metadata = {
  title: 'Bionk Personalizar',
  description:
    'Edite seu perfil Bionk em poucos cliques. Compartilhe seu link único e comece a crescer hoje mesmo!',
}

export default function Perfil() {
  return (
    <>
      <Sidebar />
      <main className="flex ml-0 md:ml-64  ">
        <PersonalizarClient />
        <div className='hidden lg:block'>
          <IframePreview />
        </div>
      </main>
    </>
  )
}
