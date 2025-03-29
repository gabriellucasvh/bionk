import React from 'react'
import SearchResultsPage from './search.client'
import HeaderAjuda from '../../header-ajuda'
import Footer from '@/components/Footer'

const search = () => {
  return (
    <div>
        <HeaderAjuda />
        <SearchResultsPage />
        <Footer />
    </div>
  )
}

export default search