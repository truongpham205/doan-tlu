import React, { Component } from 'react'
import { FormControl, Button } from 'react-bootstrap'
import logo_comment from '../../../../assets/logo_comment.png'
import '../ReviewPage.css'

class ReviewComment extends Component {
  render() {
    return (
      <div className="review-comment">
        <div className="row mx-1" style={{ justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600, fontSize: '20px' }}>Bình luận </span>
          <span style={{ fontSize: '20px' }}>02 Bình luận </span>
        </div>
        <div style={{ marginTop: 20 }}>
          <div className="row">
            <div className="col-2" style={{ textAlign: 'center', alignItems: 'center', fontSize: 16 }}>
              <div className="mb-2">
                <img src={logo_comment} width="70" height="70" style={{ borderRadius: 50 }} />
              </div>
              <span>Khách #1125</span>
            </div>
            <div className="col-10" style={{ textAlign: 'left', alignItems: 'center' }}>
              <FormControl
                className="input-comment"
                placeholder="Bình Luận ..."
                style={{ height: 60, borderRadius: 10, fontSize: 20, padding: 19 }}
              />
              <Button
                className="review-up_button"
                style={{
                  backgroundColor: '#0ABE35',
                  border: 'none',
                }}
              >
                Đăng
              </Button>
            </div>
          </div>
        </div>
        <div className="review-comment-history">
          <div className="review-comment-history-item row" style={{ flex: 1 }}>
            <div>
              <img src={logo_comment} />
            </div>
            <div className="col">
              <div
                className="row"
                style={{ flex: 1, justifyContent: 'space-between', marginRight: 5, fontSize: 18, fontWeight: 600 }}
              >
                <span>Khách #1125</span>
                <span style={{ color: '#707070' }}>
                  <i className="far fa-clock" /> 15/12/2020
                </span>
              </div>
              <div className="row" style={{ fontSize: 20, marginRight: 5, maxWidth: 700, marginTop: 10 }}>
                <span>
                  Tôi từng đi du lịch Sapa, nhưng trải nghiệm ko mấy dễ dàng. Ước gì tôi đọc được bài viết này sớm hơn
                </span>
              </div>
            </div>
          </div>
          {/*  */}
          <div className="review-comment-history-item row" style={{ flex: 1 }}>
            <div>
              <img src={logo_comment} />
            </div>
            <div className="col">
              <div
                className="row"
                style={{ flex: 1, justifyContent: 'space-between', marginRight: 5, fontSize: 18, fontWeight: 600 }}
              >
                <span>Thu Hương</span>
                <span style={{ color: '#707070' }}>
                  <i className="far fa-clock" /> 15/12/2020
                </span>
              </div>
              <div className="row" style={{ fontSize: 20, marginRight: 5, maxWidth: 700, marginTop: 10 }}>
                <span>Bài viết rất chân thực, hữu ích 👌👌👌</span>
              </div>
            </div>
          </div>
        </div>
        <div className="load-more">
          <span>Xem thêm ...</span>
        </div>
      </div>
    )
  }
}

export default ReviewComment
