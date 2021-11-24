import React, { Component } from 'react'
import '../ReviewPage.css'

class ReviewBanner extends Component {
  render() {
    return (
      <div className="container-header">
        <div className="bg-red col-sm-12" style={{ width: '100%', height: 440, marginTop: 27, borderRadius: 30 }}>
          image
        </div>
        <div className="review-detail_block">
          <div className="col-12 review-page_title">
            <span>Hành trình khám phá Lào Cai</span>
          </div>
          <div className="col review-info">
            <span>
              <i className="far fa-clock" /> 15:00
            </span>
            <span> 21/12/2020 | </span>
            <span>251 lượt xem | </span>
            <span>2 bình luận</span>
          </div>
        </div>
      </div>
    )
  }
}

export default ReviewBanner
