import React, { Component } from 'react'
import CarouselMultiImage from 'src/components/Carousel'
import review1 from '../../../../assets/review1.png'
import review2 from '../../../../assets/review2.png'
import review3 from '../../../../assets/review3.png'
import '../ReviewPage.css'

class ReviewSimilar extends Component {
  render() {
    let imageArray = [{ url: review1 }, { url: review2 }, { url: review3 }, { url: review3 }, { url: review3 }]
    return (
      <div className="container-header review-tour">
        <div className="review-similar_text">
          <span>BÀI VIẾT TƯƠNG TỰ</span>
        </div>
        {/* <div className="review-block">
          <div>
            <i className="fas fa-chevron-left review-control"></i>
          </div>
          <div className="review-list">
            <ul>
              <li>
                <Link to={ROUTER.REVIEW_PAGE} style={{ color: 'black', textDecoration: 'none' }}>
                  <div className="reivew-item bg-red" style={{ width: '465px', height: '260px' }}>
                    <img src={review1} style={{ width: '465px', height: '260px' }} />
                  </div>
                  <div className="review-title">
                    <span>Kinh nghiệm lần đầu làm chuyện ấy!</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link to={ROUTER.REVIEW_PAGE} style={{ color: 'black', textDecoration: 'none' }}>
                  <div className="reivew-item bg-red" style={{ width: '465px', height: '260px' }}>
                    <img src={review2} style={{ width: '465px', height: '260px' }} />
                  </div>
                  <div className="review-title">
                    <span>Những thú vui khi đi du lịch Tam Đảo trong mùa hè !</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link to={ROUTER.REVIEW_PAGE} style={{ color: 'black', textDecoration: 'none' }}>
                  <div className="reivew-item bg-red" style={{ width: '465px', height: '260px' }}>
                    <img src={review3} style={{ width: '465px', height: '260px' }} />
                  </div>
                  <div className="review-title">
                    <span>Trải nghiệm phượt Hạ Long 3n2đ</span>
                  </div>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <i className="fas fa-chevron-right review-control"></i>
          </div>
        </div> */}
        <CarouselMultiImage images={imageArray}></CarouselMultiImage>
      </div>
    )
  }
}

export default ReviewSimilar
