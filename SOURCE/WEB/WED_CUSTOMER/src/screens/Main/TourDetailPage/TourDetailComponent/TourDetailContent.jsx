import React from 'react'
import '../TourDetailPage.css'
import { STRING } from '@constants/Constant'

const TourDetailContent = (props) => {
  const { content } = props

  return (
    <div className="content-block">
      <div className="service-title_text">
        <span>{STRING.detailDescription}</span>
      </div>
      <div>
        <span>Giới thiệu về các tiện nghi và dịch vụ tại nơi lưu trú</span>
      </div>
      <div className="tour-description">
        <div dangerouslySetInnerHTML={{ __html: content }}></div>
      </div>
    </div>
  )
}

export default TourDetailContent
