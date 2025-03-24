import React from 'react'
import SearchResultsPage from './search.client'
import HeaderAjuda from '../../header-ajuda'
import FooterAjuda from '../../footer-ajuda'

const search = () => {
  return (
    <div>
        <HeaderAjuda />
        <SearchResultsPage />
        <FooterAjuda />
    </div>
  )
}

export default search