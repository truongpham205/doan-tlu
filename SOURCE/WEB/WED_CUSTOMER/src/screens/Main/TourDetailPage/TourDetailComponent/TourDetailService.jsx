import React from 'react'
import '../TourDetailPage.css'

const TourDetailService = (props) => {
  const { cost } = props
  return (
    <div className="content-block">
      <div className="service-title_text">
        <span>Dịch vụ</span>
      </div>
      <div>
        <span>Giới thiệu về các dịch vụ đi kèm</span>
      </div>
      <div className="tour-description">
        <div>{cost}</div>
      </div>
    </div>
  )
}

export default TourDetailService
