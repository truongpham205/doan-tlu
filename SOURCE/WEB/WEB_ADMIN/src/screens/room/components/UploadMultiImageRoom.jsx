import React from 'react'
import PropTypes from 'prop-types'
import UploadMultiImages from 'components/UploadMultiImages'
import { FormFeedback, Input, Spinner, FormGroup, Row, Col, Label, Button } from 'reactstrap'
import { STRING } from 'constants/Constant'
UploadMultiImageRoom.propTypes = {
  listImage: PropTypes.array,
  editRoom: PropTypes.bool,
}

UploadMultiImageRoom.defaultProps = {
  listImage: [],
  editRoom: false,
}

function UploadMultiImageRoom(props) {
  const { listImage, editRoom } = props
  return (
    <Row>
      <Col xs="12" md="3" lg="2">
        <Label for="exampleEmail">{STRING.roomPhoto}</Label>
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
                edit={editRoom}
                // detail={productDetail}
              />
            ) : (
              <UploadMultiImages
                numberOfElement={1}
                text={`Ảnh số ${index}`}
                index={index}
                changeMultiImages={props.handleChangeMultiImg}
                fileListImg={item?.fileList}
                edit={editRoom}
                // detail={productDetail}
              />
            )}
          </Col>
        ))}
      </Col>
    </Row>
  )
}

export default React.memo(UploadMultiImageRoom)
