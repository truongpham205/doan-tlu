import React from 'react'
import 'styles/LoadingData.css'
import 'styles/LoadingAction.css'
import { STRING } from 'constants/Constant'
const Loading = () => {
  return (
    <div className="loader-containerr">
      <div
        className="d-flex flex-column justify-content-center align-items-center"
        style={{ width: 280, height: 180, backgroundColor: 'white', borderRadius: 5 }}
      >
        <div className="spinner">
          <div className="bar1"></div>
          <div className="bar2"></div>
          <div className="bar3"></div>
          <div className="bar4"></div>
          <div className="bar5"></div>
          <div className="bar6"></div>
          <div className="bar7"></div>
          <div className="bar8"></div>
          <div className="bar9"></div>
          <div className="bar10"></div>
          <div className="bar11"></div>
          <div className="bar12"></div>
        </div>
        <div>
          <span style={{ fontWeight: 600 }}>{STRING.processing}</span>
        </div>
      </div>
    </div>
  )
}
export default Loading
