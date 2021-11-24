import React from 'react'
import PropTypes from 'prop-types'
import UploadMultiImages from 'components/UploadMultiImages'
import { FormFeedback, Input, Spinner, FormGroup, Row, Col, Label, Button } from 'reactstrap'
import { STRING } from 'constants/Constant'
UploadMultiImageTour.propTypes = {
  listImage: PropTypes.array,
  editTour: PropTypes.bool,
}

UploadMultiImageTour.defaultProps = {
  listImage: [],
  editTour: false,
}

function UploadMultiImageTour(props) {
  const { listImage, editTour } = props
  return (
    <Row>
      <Col xs="12" md="3" lg="2">
        <Label for="exampleEmail">{STRING.tourPhoto}</Label>
      </Col>
      <Col xs="12" md="8" lg="9" className="row">
        {listImage?.map((item, index) => (
          <Col xs="6" sm="4" xl="3" xxl="2" key={index}>
            {index === 0 ? (
              <UploadMultiImages
                numberOfElement={1}
                text={STRING.avatar}
                index={index}
                changeMultiImages={props.handleChangeMultiImg}
                fileListImg={item?.fileList}
                edit={editTour}
                // detail={productDetail}
              />
            ) : (
              <UploadMultiImages
                numberOfElement={1}
                text={`Ảnh số ${index}`}
                index={index}
                changeMultiImages={props.handleChangeMultiImg}
                fileListImg={item?.fileList}
                edit={editTour}
                // detail={productDetail}
              />
            )}
          </Col>
        ))}
      </Col>
    </Row>
  )
}

export default React.memo(UploadMultiImageTour)
