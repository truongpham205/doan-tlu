import { useHistory, Link } from 'react-router-dom'
import { ROUTER } from '@constants/Constant'

import React, { useRef, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'

import 'swiper/swiper.min.css'
import 'swiper/components/pagination/pagination.min.css'
import CardLocation from '../../../../components/CardLocation'

import './styles.css'
import SwiperCore, { Pagination } from 'swiper/core'
SwiperCore.use([Pagination])

const TourFavourite = (props) => {
  const { toursFavourite } = props
  let history = useHistory()

  return (
    <div className="tourFavourite">
      {/* <div className="clearfix vi-header">
        <h3 className="vi-left-title pull-left">Những Tour khách yêu thích</h3>
      </div> */}

      <div>
        <h4>Những Tour khách yêu thích</h4>
        <p>Những địa điểm được yêu thích nhất tại Ohotour</p>
      </div>
      <div className="gallery-location">
        <Swiper
          breakpoints={{
            320: {
              slidesPerView: 1,
              spaceBetween: 20,
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 40,
            },
            1024: {
              slidesPerView: 4,
              spaceBetween: 50,
            },
          }}
          className="mySwiper"
          // style={{ marginTop: "30px", marginBottom: "30px" }}
        >
          {toursFavourite?.news?.length > 0 &&
            toursFavourite?.news?.map((value, key) => (
              <>
                <SwiperSlide>
                  <CardLocation
                    image={value?.image}
                    description={value?.title}
                    handle={() => history.push(ROUTER.SERVICE_DETAIL + `/${value.id}`)}
                  />
                  {/* <img
                  className="gallery-room_img"
                  src={value?.image}
                  style={{ cursor: 'pointer', objectFit: 'cover', height: '200px' }}
                  onClick={() => history.push(ROUTER.SERVICE_DETAIL + `/${value.id}`)}
                />
                <div className="gallery-item_text">{value?.name}</div> */}
                </SwiperSlide>
              </>
            ))}
        </Swiper>
      </div>
    </div>
  )
}

export default TourFavourite
