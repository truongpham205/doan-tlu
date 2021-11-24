import { ROUTER } from '@constants/Constant'
import Container from '@material-ui/core/Container'
import React from 'react'
import { useLocation } from 'react-router-dom'
import logo from '../../../assets/logo.png'
import ContactComponent from './ContactComponent'
import './Footer.css'
import PaymentComponent from './PaymentComponent'
import MailOutlineIcon from '@material-ui/icons/MailOutline'
import PhoneIcon from '@material-ui/icons/Phone'
import RoomIcon from '@material-ui/icons/Room'

import visa from '../../../assets/visa-1.png'
import mastercard from '../../../assets/mastercard-1.png'
import paypal from '../../../assets/paypal2.png'
import mess from '../../../assets/messenger.png'
import phone from '../../../assets/phone.png'
import map from '../../../assets/map.png'
import gmail from '../../../assets/gmail.png'
import GoogleMap from '../../GoogleMap'

const Footer = () => {
  let location = useLocation()

  return (
    <>
      {location.pathname !== ROUTER.LOGIN &&
        location.pathname !== ROUTER.REGISTER &&
        location.pathname !== ROUTER.FORGOT_PASSWORD && (
          // <div className="p-0 footer_fluid">
          <div className="footer-container">
            <Container maxWidth="lg">
              <div>
                <div className="row mt-5" style={{ textAlign: 'left' }}>
                  <div className="col-lg-3 col-md-6 col-sm-6 footer_element">
                    <div>
                      <img src={logo} style={{ width: 200 }} height="auto" alt="logo" />
                    </div>
                    <div className="about-me_list" style={{ listStyle: 'none' }}>
                      <ui>
                        <li className="mb-2" style={{ display: 'flex', alignItems: 'center' }}>
                          <span>
                            <img src={phone} />{' '}
                          </span>
                          <span className="ml-2">
                            <div>
                              <strong>Call center</strong>
                            </div>
                            <a href="tel:0932209058" className="link-footer">
                              093 220 9058
                            </a>
                          </span>
                        </li>
                        <li className="mb-2" style={{ display: 'flex', alignItems: 'center' }}>
                          <span>
                            <img src={mess} />
                          </span>
                          <span className="ml-2">
                            <div>
                              <strong>Messenger</strong>
                            </div>

                            <a
                              href="https://www.messenger.com/t/100024668478590"
                              className="link-footer"
                              target="_blank"
                            >
                              https://www.messenger.com
                            </a>
                          </span>
                          {/* <img src={mess} /> <span>ohotour@gmail.com</span> */}
                        </li>
                        <li className="mb-2" style={{ display: 'flex', alignItems: 'center' }}>
                          <span>
                            <img src={gmail} />
                          </span>
                          <span className="ml-2">
                            <div>
                              <strong>Gmail</strong>
                            </div>

                            <a href="mailto:duongvanchien1003@gmail.com" className="link-footer" target="_blank">
                              ohotour_test@gmail.com
                            </a>
                          </span>
                        </li>
                        <li className="mb-2" style={{ display: 'flex', alignItems: 'center' }}>
                          <span>
                            <img src={map} />
                          </span>
                          <span className="ml-2">
                            <div>
                              <strong>Address</strong>
                            </div>

                            <a
                              href="https://www.google.com/maps/place/H%E1%BB%8Dc+vi%E1%BB%87n+C%C3%B4ng+ngh%E1%BB%87+B%C6%B0u+ch%C3%ADnh+vi%E1%BB%85n+th%C3%B4ng/@20.980506,105.7857363,17z/data=!3m1!4b1!4m5!3m4!1s0x3135accdd8a1ad71:0xa2f9b16036648187!8m2!3d20.980506!4d105.787925"
                              className="link-footer"
                              target="_blank"
                            >
                              Tầng 3 Tháp G1 Toà FiveStar số 2 Kim Giang Thanh Xuân Hà Nội
                            </a>
                          </span>
                        </li>
                      </ui>
                    </div>
                  </div>

                  <div className="col-lg-3 col-md-6 col-sm-6 footer_element p-0">
                    <div>
                      <span className="footer-menu_text">PHƯƠNG THỨC THANH TOÁN</span>
                    </div>
                    <img src={visa} alt="Visa" />
                    <img src={mastercard} alt="Mastercard" className="mr-1 ml-1" />
                    <img src={paypal} alt="Paypal" />
                    <div style={{ paddingTop: '30px' }}>
                      <span style={{ fontWeight: 500 }}>Giờ làm việc</span>
                      <div style={{ marginTop: '15px' }}>
                        <span>9:00 - 17:30, thứ 2 - thứ 6</span>
                        <br />
                        <span>(Nghỉ T7, CN và các ngày lễ)</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-3 col-md-6 col-sm-6 footer_element">
                    <div className="footer-menu_text">
                      <span>VỀ CHÚNG TÔI</span>
                    </div>
                    <div className="about-me_list">
                      <ui>
                        <li className="about-item">
                          <span onClick={() => window.open('https://vi.wikipedia.org/wiki/Blog', '_target')}>Blog</span>
                        </li>
                        <li className="about-item">
                          <span
                            onClick={() =>
                              window.open(
                                'https://vi.wikipedia.org/wiki/Wikipedia:%C4%90i%E1%BB%81u_kho%E1%BA%A3n_S%E1%BB%AD_d%E1%BB%A5ng',
                                '_target'
                              )
                            }
                          >
                            Điều khoản hoạt động
                          </span>
                        </li>
                        <li className="about-item">
                          <span
                            onClick={() =>
                              window.open(
                                'https://vi.wikipedia.org/wiki/Wikipedia:%C4%90i%E1%BB%81u_kho%E1%BA%A3n_S%E1%BB%AD_d%E1%BB%A5ng',
                                '_target'
                              )
                            }
                          >
                            Chính sách bảo mật
                          </span>
                        </li>
                        <li className="about-item">
                          <a href="https://www.instagram.com/c.ronaldo7egend/" target="_blank" className="link-footer">
                            Instagram
                          </a>
                        </li>

                        <li className="about-item">
                          <a href="tel:0932209058" className="link-footer">
                            093 220 9058
                          </a>
                        </li>

                        <li className="about-item">
                          <a href="https://www.facebook.com/tunqnguyen86" target="_blank" className="link-footer">
                            Facebook
                          </a>
                        </li>

                        <li className="about-item">
                          <a href="mailto:duongvanchien1003@gmail.com" target="_blank" className="link-footer">
                            ohotour_test@gmail.com
                          </a>
                        </li>
                      </ui>
                    </div>
                  </div>

                  <div className="col-lg-3 col-md-6 col-sm-6 footer_element">
                    <div className="footer-menu_text">
                      <span>ĐỊA CHỈ LIÊN HỆ</span>
                    </div>
                    <div className="about-me_list">
                      <GoogleMap />
                    </div>
                  </div>
                </div>
              </div>
            </Container>
          </div>

          // </div>
        )}
    </>
  )
}

export default Footer
