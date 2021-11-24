import React, { Component } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import Footer from 'src/components/Common/Footer/Footer'
import Header from 'src/components/Common/Header/Header'
import Auth from './Components/Auth'
export default class AuthScreen extends Component {
  render() {
    return (
      <>
        <Header />
        <Container fluid style={{ backgroundColor: '#f0f0f0' }}>
          <Container>
            <Row className="py-3">
              <Col xs={12} md={4} style={{ backgroundColor: 'white', borderRadius: '5px' }}>
                <Auth />
              </Col>
              <Col xs={12} md={8}>
                <div className="py-3 px-3" style={{ backgroundColor: 'white', borderRadius: '5px' }}>
                  <h4>Hướng dẫn sử dụng JobShare</h4>
                  <p>1. Đăng ký tài khoản mới</p>
                  <p>2. Viết CV trực tiếp trên JobShare</p>
                  <p>3. Tải CV dạng PDF về máy</p>
                  <p>4. Ứng tuyển các việc làm hot ngay trên JobShare</p>
                  <div className="py-2">
                    <img
                      src={require('@src/assets/background-job.jpg')}
                      className="col-lg-12 col-md-12 col-12"
                      width="683"
                      height="413"
                    />
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </Container>
        <Footer />
      </>
    )
  }
}
