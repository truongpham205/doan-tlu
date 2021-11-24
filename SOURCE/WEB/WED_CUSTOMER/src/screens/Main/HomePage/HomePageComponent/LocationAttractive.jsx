import { useHistory, Link } from 'react-router-dom'
import { ROUTER, IMAGE_REGION } from '@constants/Constant'

import React, { useRef, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'

import 'swiper/swiper.min.css'
import 'swiper/components/pagination/pagination.min.css'

import './styles.css'
import SwiperCore, { Pagination } from 'swiper/core'
import CardAttractive from '../../../../components/CardAttractive'

SwiperCore.use([Pagination])

const LocationAttractive = (props) => {
  const { locations } = props
  let history = useHistory()

  const items = []
  const item =
    locations?.length &&
    locations.map((value) => {
      const item = IMAGE_REGION.find((i) => i.id === value?.id)
      items.push(
        <SwiperSlide>
          <CardAttractive
            image={item?.url}
            name={value?.name}
            handle={() => history.push(ROUTER.TOUR_PAGE + `/${value?.id}`)}
            description={item.shortDes}
          />
        </SwiperSlide>
      )
    })

  return (
    <div>
      <div>
        <h4>Địa điểm thu hút</h4>
        <p>Cùng Ohotour bắt đầu chuyến hành trình chinh phục thế giới của bạn</p>
      </div>
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
            slidesPerView: 3,
            spaceBetween: 30,
          },
        }}
        loop={true}
        className="mySwiper"
        style={{ position: 'relative', minHeight: 400, paddingBottom: 2 }}
      >
        {/* {items} */}
        {locations?.length &&
          locations.map((value, key) => (
            <SwiperSlide key={key}>
              <CardAttractive
                image={value?.url}
                name={value?.name}
                handle={() => history.push(ROUTER.TOUR_PAGE + `/${value?.id}`)}
                description={value.content}
              />
            </SwiperSlide>
          ))}
      </Swiper>
    </div>
  )
}

export default LocationAttractive
