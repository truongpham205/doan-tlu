import React, { Component } from 'react'
import facebook from '../../../assets/facebook.png'
import instargram from '../../../assets/instargram.png'
import youtube from '../../../assets/youtube.png'
import mes from '../../../assets/mes.png'
import './Footer.css'
class ContactComponent extends Component {
  render() {
    return (
      <div className="col-sm-12">
        <div className="row" style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
          <div id="menu">
            <ui>
              <li>
                <img src={facebook} width="41" height="auto" alt="facebook" />
              </li>
              <li>
                <img src={instargram} width="41" height="auto" alt="instargram" />
              </li>
              <li>
                <img src={youtube} width="41" height="auto" alt="youtube" />
              </li>
              <li>
                <img src={mes} width="41" height="auto" alt="mes" />
              </li>
            </ui>
          </div>
          {/* <div className="col-sm-3 menu-item">
            <img src={facebook} width="41" height="auto" alt="facebook" />
          </div>
          <div className="col-sm-3 menu-item">
            <img src={facebook} width="41" height="auto" alt="facebook" />
          </div>
          <div className="col-sm-3 menu-item">
            <img src={facebook} width="41" height="auto" alt="facebook" />
          </div>
          <div className="col-sm-3 menu-item">
            <img src={facebook} width="41" height="auto" alt="facebook" />
          </div> */}
        </div>
      </div>
    )
  }
}

export default ContactComponent
