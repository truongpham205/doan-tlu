import React from 'react'
import logo_comment from '../../../../assets/logo.png'
import '../TourDetailPage.css'
import { STRING } from '@constants/Constant'
import { handleRating } from '@utils/handleRating.js'
import moment from 'moment'

const TourDetailReview = (props) => {
  const { reviews } = props
  return (
    <div>
      <div className="service-title_text">
        <span>{STRING.evaluate}</span>
      </div>
      <div>
        <span>Các đánh giá nổi bật</span>
      </div>
      <div className="card-footer card-comments tour-description" >
        {reviews?.length > 0 &&
          reviews?.map((value) => (
            // <div className="review-history-tour">
            //   <div className="item col">
            //     <div className="row" style={{ borderRadius: 50 }}>
            //       <div>
            //         {value?.profile_image ? (
            //           <img
            //             src={value?.profile_image}
            //             style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover' }}
            //           />
            //         ) : (
            //           <img
            //             src={logo_comment}
            //             style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover' }}
            //           />
            //         )}
            //       </div>
            //       <div className="col">
            //         <div className="row mx-1 review-item-name">
            //           <span className="name-history-review">{value?.customer_name}</span>
            //           <span className="time-history-review">{moment(value?.created_at).format('hh:mm DD-MM-YYYY')}</span>
            //         </div>
            //         <div className="m-0 p-0">
            //           <span className="star m-0 px-1">{handleRating(value?.rating || 5)}</span>
            //         </div>
            //         <div className="content-review-history">
            //           <span>{value?.note}</span>
            //         </div>
            //       </div>
            //     </div>
            //   </div>
            // </div>

            <div className="card-comment">
              {/* User image */}
              {value?.profile_image ? (
                <img
                  className="img-circle img-sm"
                  src={value?.profile_image}
                  alt="User Image"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <img className="img-circle img-sm" src={logo_comment} alt="User Image" style={{ objectFit: 'cover' }} />
              )}
              <div className="comment-text">
                <span className="username">
                  {value?.customer_name || 'Béo ẩn danh'}
                  <span className="text-muted float-right">{moment(value?.created_at).format('hh:mm DD-MM-YYYY')}</span>
                </span>
                {/* /.username */}
                {value?.note}
              </div>
              <div className="m-0 p-0" style={{ float: 'right' }}>
                <span className="star m-0 p-0">{handleRating(value?.rating || 5)}</span>
              </div>
              {/* /.comment-text */}
            </div>
          ))}
      </div>
    </div>
  )
}

export default TourDetailReview
