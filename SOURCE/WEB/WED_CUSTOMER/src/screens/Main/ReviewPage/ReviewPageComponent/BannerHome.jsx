import React, { Component } from 'react'
import home1 from '../../../../assets/home1.png'
import home2 from '../../../../assets/home2.png'
import home3 from '../../../../assets/home3.png'

class BannerHome extends Component {
  render() {
    return (
      <div className="list-care-block">
        <div className="care-title_text">
          <span>CÓ THỂ BẠN QUAN TÂM</span>
        </div>
        <div>
          <ul className="list-care ">
            <li>
              <div className="row list-care-home ">
                <div>
                  <img src={home1} />
                </div>
                <div className="col">
                  <div className="home-item_title mx-2">
                    <span>Nhà đẹp giá tốt</span>
                  </div>
                  <div className="mx-2 home-item_content">
                    <span>
                      Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut
                      labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo
                      dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
                      amet. Lorem ipsum dolor sit amet, consetetur sadipscing
                    </span>
                  </div>
                </div>
              </div>
            </li>
            <li>
              <div className="row list-care-home ">
                <div>
                  <img src={home2} />
                </div>
                <div className="col">
                  <div className="home-item_title mx-2">
                    <span>Nhà đẹp giá tốt</span>
                  </div>
                  <div className="mx-2 home-item_content">
                    <span>
                      Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut
                      labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo
                      dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
                      amet. Lorem ipsum dolor sit amet, consetetur sadipscing
                    </span>
                  </div>
                </div>
              </div>
            </li>
            <li>
              <div className="row list-care-home ">
                <div>
                  <img src={home3} />
                </div>
                <div className="col">
                  <div className="home-item_title mx-2">
                    <span>Nhà đẹp giá tốt</span>
                  </div>
                  <div className="mx-2 home-item_content">
                    <span>
                      Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut
                      labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo
                      dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
                      amet. Lorem ipsum dolor sit amet, consetetur sadipscing
                    </span>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    )
  }
}

export default BannerHome
