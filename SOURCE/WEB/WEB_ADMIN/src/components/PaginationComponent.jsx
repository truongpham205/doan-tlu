import React from 'react'
import PropTypes from 'prop-types'
import Pagination from 'react-js-pagination'

PaginationComponent.propTypes = {
  activePage : PropTypes.number.isRequired,
  action :PropTypes.func,
  totalItemsCount :  PropTypes.number.isRequired,
  itemCountPerPage :  PropTypes.number.isRequired,

  // {activePage, action, totalItemsCount, itemCountPerPage }
}

PaginationComponent.defaultProps = {
  activePage :0,
  action : ()=>{},
  totalItemsCount : 0,
  itemCountPerPage : 0,
}

function PaginationComponent (props){
  const {activePage, action, totalItemsCount, itemCountPerPage } = props
  return (
    <>
      <div style={{ opacity: 0.99 }} className="col-auto">
        <Pagination
          itemClass="page-item"
          linkClass="page-link"
          // hideDisabled
          activePage={activePage}
          totalItemsCount={totalItemsCount}
          itemsCountPerPage={itemCountPerPage}
          pageRangeDisplayed={5}
          // hideNavigation
          FirstLastPages
          onChange={(page) => action(page)}
        />
      </div>
    </>
  )
}

export default PaginationComponent;



// const PaginationComponent = ({activePage, action, totalItemsCount, itemCountPerPage }) => {
  // return (
  //   <>
  //     <div style={{ opacity: 0.99 }} className="col-auto">
  //       <Pagination
  //         itemClass="page-item"
  //         linkClass="page-link"
  //         // hideDisabled
  //         activePage={activePage}
  //         totalItemsCount={totalItemsCount}
  //         itemsCountPerPage={itemCountPerPage}
  //         pageRangeDisplayed={5}
  //         // hideNavigation
  //         FirstLastPages
  //         onChange={(page) => action(page)}
  //       />
  //     </div>
  //   </>
//   )
// }
// export default PaginationComponent
