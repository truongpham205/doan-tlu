import { useHistory, Link } from 'react-router-dom'
import { ROUTER } from '@constants/Constant'
import { Button } from '@material-ui/core'

import React, { useRef, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'

import 'swiper/swiper.min.css'
import 'swiper/components/pagination/pagination.min.css'

import './styles.css'
import SwiperCore, { Pagination } from 'swiper/core'
import CardLocation from '../../../../components/CardLocation'
SwiperCore.use([Pagination])

const ReviewTour = (props) => {
  const handleOnDragStart = (e) => e.preventDefault()
  let history = useHistory()
  const { reviewImages } = props

  // const responsive = {
  //   0: { items: 1 },
  //   320: { items: 1 },
  //   600: { items: 1 },
  //   1020: { items: 2 },
  //   1280: { items: 3 },
  // }
  // const items = []
  // const item =
  //   reviewImages?.length > 0 &&
  //   reviewImages?.map((value) => {
  //     items.push(
  //       <img
  //         src={value.url}
  //         onDragStart={handleOnDragStart}
  //         className="image-review-tour"
  //         onClick={() => history.push(ROUTER.NEW_DETAIL + `/${value?.id}`)}
  //         // style={{ height: '300px', width: '100%', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer' }}
  //       />
  //     )
  //   })
  return (
    <div className="review-tour">
      {/* <div className="clearfix vi-header">
        <h3 className="vi-left-title pull-left">Review đánh giá</h3>
      </div> */}

      <div>
        <h4>Review đánh giá</h4>
        <p>Những đánh giá nổi bật của khách hàng</p>
      </div>
      <div className="row">
        {reviewImages?.length > 0 &&
          reviewImages?.map((value, key) => (
            <div className="col-md-12 col-lg-6 col-xl-4" key={key}>
              <div className="card mb-2 bg-gradient-dark" style={{ border: 'none', maxHeight: '250px' }}>
                <img
                  className="card-img-top"
                  src={value?.url}
                  alt="Dist Photo 1"
                  style={{ objectFit: 'cover', height: '100%' }}
                />
                <div className="card-img-overlay card-content">
                  <Button
                    variant="contained"
                    color="primary"
                    style={{
                      backgroundColor: 'green',
                      width: '50%',
                      margin: 'auto',
                      marginBottom: 0,
                      marginTop: 0,
                    }}
                    onClick={() => history.push(ROUTER.NEW_DETAIL + `/${value?.id}`)}
                  >
                    Xem chi tiết
                  </Button>
                  <p class="card-text text-white pb-2 pt-1">{value?.title}</p>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* <Swiper
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
      >
        {reviewImages?.length > 0 &&
          reviewImages?.map((value, key) => (
            <>
              <SwiperSlide key={key}>
                <CardLocation
                  image={value?.url}
                  description={value?.title}
                  handle={() => history.push(ROUTER.NEW_DETAIL + `/${value?.id}`)}
                  isReview={true}
                />
              </SwiperSlide>
            </>
          ))}
      </Swiper> */}
    </div>
  )
}

export default ReviewTour
