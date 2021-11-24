import { Image } from 'antd'
import React from 'react'
import 'swiper/swiper.min.css'
import 'swiper/components/navigation/navigation.min.css'
import 'swiper/components/pagination/pagination.min.css'
import '../TourDetailPage.css'
import { Swiper, SwiperSlide } from 'swiper/react'
import SwiperCore, { Autoplay, Pagination, Navigation } from 'swiper/core'

SwiperCore.use([Autoplay, Pagination, Navigation])

const TourDetailImage = (props) => {
  const { images, image_new } = props

  let listImage = []

  images &&
    images.forEach((image, key) => {
      if (image.type == 1) {
        listImage.push(image.path)
      }
    })

  return (
    <div>
      <Image.PreviewGroup>
        <Swiper
          slidesPerView={listImage?.length}
          spaceBetween={5}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          loop={true}
          pagination={{
            clickable: true,
          }}
          navigation={true}
          className="mySwiper slide-tour"
        >
          {listImage &&
            listImage?.length > 0 &&
            listImage?.map((value, key) => (
              <>
                <SwiperSlide>
                  <Image
                    // className="gallery-room_img"
                    src={value}
                    className="tour-detail_image"
                  />
                </SwiperSlide>
              </>
            ))}
          {image_new && (
            <SwiperSlide>
              <Image
                // className="gallery-room_img"
                src={image_new}
                className="tour-detail_image"
              />
            </SwiperSlide>
          )}
        </Swiper>
      </Image.PreviewGroup>
    </div>
  )
}

export default TourDetailImage
