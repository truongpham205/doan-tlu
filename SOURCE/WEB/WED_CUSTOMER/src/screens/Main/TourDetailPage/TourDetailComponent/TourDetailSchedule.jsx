import React from 'react'
import { STRING } from '@constants/Constant'

const TourDetailSchedule = (props) => {
  const { schedule } = props
  return (
    <div className="content-block">
      <div className="service-title_text">
        <span>{STRING.schedule}</span>
      </div>
      <div>
        <span>Giới thiệu về lịch trình di chuyển</span>
      </div>
      <div className="tour-description">
        <div dangerouslySetInnerHTML={{ __html: schedule }}></div>
      </div>
    </div>
  )
}

export default TourDetailSchedule
