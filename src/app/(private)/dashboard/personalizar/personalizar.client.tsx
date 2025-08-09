import CategoriasTemplates from './components/personalizar.CategoriasTemplates'

const PersonalizarClient = () => {

    return (
        <div className='min-h-screen w-full lg:w-7/12 bg-white text-black font-gsans'>
            <section className='min-h-screen flex flex-col gap-10 px-6 py-16'>

                <section>
                    <h2 className='hidden lg:block font-bold text-lg md:text-2xl mb-4'>Templates:</h2>
                    <CategoriasTemplates />
                </section>
            </section>
        </div>
    )
}

export default PersonalizarClient
