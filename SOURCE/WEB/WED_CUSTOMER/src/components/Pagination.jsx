import React from 'react'
import Pagination from 'react-js-pagination'

export const Pagi = (props) => {
  const { paging } = props
  return (
    <div>
      <Pagination
        itemClass="page-item"
        linkClass="page-link"
        hideDisabled
        activePage={Number(paging?.page)}
        itemsCountPerPage={paging?.limit}
        totalItemsCount={paging?.count || 0}
        pageRangeDisplayed={5}
        hideNavigation
        onChange={(page) => props.handlePageChange(page)}
      />
    </div>
  )
}
