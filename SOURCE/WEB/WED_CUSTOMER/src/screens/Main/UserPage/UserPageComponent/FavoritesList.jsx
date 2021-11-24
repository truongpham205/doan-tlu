import { Empty } from 'antd'
import React from 'react'
import ReviewCard from '../../../../components/ReviewCard'

FavoritesList.propTypes = {}

function FavoritesList(props) {
  const { listService } = props
  return (
    <>
      <div className="tab-detail">
        <div className="row">
          <h4>DANH SÁCH YÊU THÍCH</h4>
        </div>
      </div>
      <div className="row">
        {listService?.length > 0 ? (
          listService?.map((value) => (
            <div className="mt-4 col-xl-3 col-md-4 ">
              <ReviewCard tourDetail={value} />
            </div>

            // <div className="tour_element">
            //   <TourItem tourDetail={value} />
            // </div>
          ))
        ) : (
          <Empty description="Không có dữ liệu" style={{ margin: 'auto' }} />
        )}
      </div>
    </>
  )
}

export default FavoritesList
