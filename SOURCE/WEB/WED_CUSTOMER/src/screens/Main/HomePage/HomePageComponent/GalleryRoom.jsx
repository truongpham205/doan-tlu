import { useHistory, Link } from 'react-router-dom'
import { ROUTER } from '@constants/Constant'

import React, { useRef, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'

import 'swiper/swiper.min.css'
import 'swiper/components/pagination/pagination.min.css'

import './styles.css'
import SwiperCore, { Pagination } from 'swiper/core'
import MediaCard from '../../../../components/CardGallery'

SwiperCore.use([Pagination])

const GalleryRoom = (props) => {
  const { cates } = props
  let history = useHistory()
  return (
    <>
      {/* <div className="clearfix vi-header">
        <h3 className="vi-left-title pull-left">Danh sách dịch vụ</h3>
      </div> */}

      <div>
        <h4>Danh sách dịch vụ</h4>
        <p>Để mỗi chuyến đi là một hành trình truyền cảm hứng, mỗi căn phòng là một khoảng trời an yên</p>
      </div>

      {/* <div className="row">
        {cates?.length > 0 &&
          cates?.map((value, key) => (
            <div
              className="col-xs-12 col-sm-6 col-md-4 col-lg d-flex mb-3 gallery-room_item"
              key={key}
              onClick={() => history.push(ROUTER.SERVICE_DETAIL + `/${value.id}`)}
            >
              <div>
                <img
                  style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '8px', marginRight: '8px' }}
                  src={value?.image}
                ></img>
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{value.name}</div>
              </div>
            </div>
          ))}
      </div> */}
      <Swiper
        breakpoints={{
          0: {
            slidesPerView: 3,
            spaceBetween: 20,
          },
          400: {
            slidesPerView: 4,
            spaceBetween: 25,
          },
          500: {
            slidesPerView: 5,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 5,
            spaceBetween: 50,
          },
        }}
        loop={true}
        // className="mySwiper"
      >
        {/* {cates?.length > 0 &&
          cates?.map((value, key) => (
            <>
              <SwiperSlide>
                <MediaCard
                  image={value.image}
                  name={value.name}
                  handle={() => history.push(ROUTER.SERVICE_DETAIL + `/${value.id}`)}
                />
              </SwiperSlide>
            </>
          ))} */}

        {cates?.length > 0 &&
          cates?.map((value, key) => (
            <SwiperSlide key={key} className="gallery-room_item" onClick={() => history.push(ROUTER.SERVICE_DETAIL + `/${value.id}`)}>
              <div
                key={key}
                // onClick={() => history.push(ROUTER.SERVICE_DETAIL + `/${value.id}`)}
                className="d-flex mb-3"
                style={{ flexDirection: 'column', justifyContent: 'center' }}
              >
                <img
                  style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '8px' }}
                  src={value?.image}
                ></img>
                <div style={{ fontSize: '14px' }}>{value.name}</div>
              </div>
            </SwiperSlide>
          ))}
      </Swiper>
    </>
  )
}

export default GalleryRoom
