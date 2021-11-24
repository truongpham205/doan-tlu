import React from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { ROUTER } from '@constants/Constant'
import { getImage } from '@utils/getImage.js'
import { handleRating } from '@utils/handleRating.js'
import { Empty } from 'antd'

const BannerAds = (props) => {
  const params = useParams()
  let history = useHistory()
  const { listService } = props

  let list = []
  const temp =
    Array.isArray(listService) &&
    listService?.forEach((value) => {
      if (Number(value.id) !== Number(params.id)) {
        list.push(value)
      }
    })
  return (
    <div className="list-care-block">
      <div className="care-title_text">
        <span>Có thể bạn quan tâm</span>
      </div>
      <div>
        {list?.length > 0 ? (
          list?.map((value) => (
            // <li
            //   className="tour_care_item"
            //   onClick={() => {
            //     history.push(ROUTER.TOUR_DETAIL_PAGE + `/${value.id}`)
            //     window.location.reload()
            //   }}
            //   style={{ boxShadow: 'rgb(0 0 0 / 35%) 0px 5px 15px', borderRadius: '4px' }}
            // >
            //   <div>
            //     <img src={getImage(value.service_images)} className="tour_care_image"></img>
            //   </div>
            //   <div className="tour_care_text">
            //     <div>{value?.name}</div>
            //     <label className="label-type">{value?.service_category_name}</label>
            //     <div className="star p-0">{handleRating(value?.rating || 5)}</div>
            //   </div>
            // </li>
            <div
              className="attachment-block clearfix"
              onClick={() => {
                history.push(ROUTER.TOUR_DETAIL_PAGE + `/${value.id}`)
                window.location.reload()
              }}
              style={{ cursor: 'pointer' }}
            >
              <img
                className="attachment-img"
                src={getImage(value.service_images)}
                alt="Attachment Image"
                style={{ objectFit: 'cover' }}
              />
              <div className="attachment-pushed">
                <h6 className="attachment-heading">{value?.name}</h6>
                <div className="attachment-text">
                  <div className="star p-0">{handleRating(value?.rating || 5)}</div>
                  <label className="label-type">{value?.service_category_name}</label>
                </div>
              </div>
            </div>
          ))
        ) : (
          <Empty description="Không có dữ liệu" style={{ margin: 'auto' }} />
        )}
      </div>
    </div>
  )
}

export default BannerAds
