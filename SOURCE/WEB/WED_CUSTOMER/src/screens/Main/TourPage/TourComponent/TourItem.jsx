import React from 'react'
import { ROUTER } from '@constants/Constant'
import { useHistory } from 'react-router-dom'
import { handleRating } from '@utils/handleRating.js'
import { getImage } from '@utils/getImage.js'

const TourItem = (props) => {
  const { tourDetail } = props
  let history = useHistory()

  return (
    <div
      className="tour-item"
      style={{ margin: 7, boxShadow: 'rgb(100 100 111 / 20%) 0px 7px 29px 0px', borderRadius: '4px' }}
      onClick={() => history.push(ROUTER.TOUR_DETAIL_PAGE + `/${tourDetail.id}`)}
    >
      <div>
        <img src={getImage(tourDetail.service_images)} />
      </div>
      <div className="col px-4" style={{ marginTop: 10 }}>
        <div className="row ">
          <span style={{ fontSize: 16, fontWeight: 500 }} className="sub_tour_element">
            {tourDetail?.name}
          </span>
          <span className="star p-0">{handleRating(tourDetail?.rating || 5)}</span>
        </div>
        <div className="row" style={{ justifyContent: 'space-between', marginTop: 5 }}>
          <span className="sub_tour_element">
            <i className="fas fa-user mr-3"></i>
            <span>{tourDetail?.people}</span>
          </span>
          <span style={{ marginRight: 50 }} className="sub_tour_element">
            <i className="fas fa-home mr-3"></i>
            <span>{tourDetail?.service_category_name}</span>
          </span>
        </div>
        <div className="row" style={{ marginTop: 5 }}>
          <span className="sub_tour_element">
            <i className="fas fa-phone-volume mr-3"></i>
            <span>{`${tourDetail?.contact_name} - ${tourDetail?.contact_phone}`}</span>
          </span>
        </div>
        <div className="row " style={{ marginTop: 5 }}>
          <span className="sub_tour_element">
            <i className="fas fa-map-marker-alt mr-3"></i>
            <span>{`${tourDetail?.district?.name} - ${tourDetail?.province?.name}`}</span>
          </span>
        </div>
      </div>
    </div>
  )
}

export default TourItem
