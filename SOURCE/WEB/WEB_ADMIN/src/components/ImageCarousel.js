import React from 'react'
import PropTypes from 'prop-types'
import Carousel, { consts } from 'react-elastic-carousel'
import { Image } from 'react-bootstrap'
import ItemCarousel from './ItemCarousel'

function ImageCarousel(props) {
  const { images, style, itemsToShow, itemsToScroll } = props
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
        <div style={{ position: 'relative', width: '7%', cursor: 'pointer' }} onClick={onClick}>
          <i
            className="fas fa-chevron-left"
            style={{
              position: 'absolute',
              top: '40%',
              left: '40%',
              fontSize: '25px',
            }}
            disabled={isEdge}
          ></i>
        </div>
      )
    } else {
      return (
        <div style={{ position: 'relative', width: '7%', cursor: 'pointer' }} onClick={onClick}>
          <i
            className="fas fa-chevron-right"
            style={{
              position: 'absolute',
              top: '40%',
              right: '40%',
              fontSize: '25px',
            }}
            disabled={isEdge}
          ></i>
        </div>
      )
    }
  }
  if (!images?.length) {
    return null
  }

  return (
    <Carousel breakPoints={breakPoints} renderArrow={myArrow}>
      {images?.map((image, index) => (
        <ItemCarousel key={index}>
          <Image src={image.url} key={image.id} thumbnail style={style} />
        </ItemCarousel>
      ))}
    </Carousel>
  )
}

ImageCarousel.propTypes = {}

export default ImageCarousel
