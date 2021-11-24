import React from 'react'
import PropTypes from 'prop-types'
import Carousel, { consts } from 'react-elastic-carousel'
import { Image } from 'react-bootstrap'
import CarouselItem from './CarouselItem'
import './Carousel.css'

CarouselMultiImage.propTypes = {
  images: PropTypes.array,
  style: PropTypes.object,
}

CarouselMultiImage.defaultProps = {
  images: [],
  style: {},
}

function CarouselMultiImage(props) {
  const { images, style } = props
  const breakPoints = [
    { width: 1, itemsToShow: 1, itemsToScroll: 1 },
    { width: 550, itemsToShow: 2, itemsToScroll: 1 },
    { width: 768, itemsToShow: 2, itemsToScroll: 1 },
    { width: 1200, itemsToShow: 3, itemsToScroll: 1 },
    { width: 1600, itemsToShow: 4, itemsToScroll: 1 },
  ]

  const myArrow = ({ type, onClick, isEdge }) => {
    if (type === consts.PREV) {
      return (
        <div className="wrapper--arrow" onClick={onClick}>
          <i className="fas fa-chevron-left arrow__left" disabled={isEdge}></i>
        </div>
      )
    }
    return (
      <div className="wrapper--arrow" onClick={onClick}>
        <i className="fas fa-chevron-right arrow__right" disabled={isEdge}></i>
      </div>
    )
  }

  if (!images.length) {
    return null
  }

  return (
    <Carousel breakPoints={breakPoints} focusOnSelect={true} autoPlaySpeed={500}>
      {images?.map((image, index) => (
        <CarouselItem key={index}>
          <Image
            src={image.url}
            key={image.id}
            style={{ PointerEvent: 'none', cursor: 'pointer', borderRadius: '1rem' }}
            className="image-carousel"
          />
        </CarouselItem>
      ))}
    </Carousel>
  )
}

export default CarouselMultiImage
