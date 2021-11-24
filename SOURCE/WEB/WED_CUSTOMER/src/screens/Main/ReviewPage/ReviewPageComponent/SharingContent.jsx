import React, { Component } from 'react'
import share1 from '../../../../assets/share1.png'
import sharefb from '../../../../assets/share-fb.png'
import sharemes from '../../../../assets/share-mes.png'
import '../ReviewPage.css'

class SharingContent extends Component {
  render() {
    return (
      <div className="sharing-block row" style={{ marginLeft: 20 }}>
        <span>Chia sẻ bài viết: </span>
        <div>
          <ul style={{ listStyle: 'none', display: 'flex' }}>
            <li>
              <div className="share-item">
                <img src={share1} width="27" />
              </div>
            </li>
            <li>
              <div>
                <img src={sharefb} width="27" />
              </div>
            </li>
            <li>
              <div>
                <img src={sharemes} width="27" />
              </div>
            </li>
          </ul>
        </div>
      </div>
    )
  }
}

export default SharingContent
