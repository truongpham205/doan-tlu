import React from 'react'
import { Col } from 'react-bootstrap'
import 'styles/OverViewScreen.css'
const OverView = ({ style, data }) => {
  return (
    <>
      {style?.map((e, index) => (
        <Col className=" col-12 col-sm-6 col-md-4 col-lg-3 p-2" key={index}>
          <div className="overView--responsive p-2" style={{ backgroundColor: `${e.color}` }}>
            <div className="m-0 overView--responsive__box">
              <i className="far fa-file-alt fa-2x"></i>
              <span className="ml-1 mt-1">{e.title}</span>
            </div>
            <h1 style={{ textAlign: 'center' }}>{data[index].value}</h1>
          </div>
        </Col>
      ))}
    </>
  )
}
export default OverView
