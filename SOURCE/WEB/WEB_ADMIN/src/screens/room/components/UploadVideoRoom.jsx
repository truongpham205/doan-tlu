import React from 'react'
import PropTypes from 'prop-types'
import { STRING } from 'constants/Constant'
import { FormFeedback, Input, Spinner, FormGroup, Row, Col, Label, Button } from 'reactstrap'
import BackgroundVideo from 'components/BackgroundVideo'
UploadVideoRoom.propTypes = {
  videoUrl: PropTypes.string,
  handleChangeVideo: PropTypes.func,
}

UploadVideoRoom.defaultProps = {
  videoUrl: '',
  handleChangeVideo: null,
}

function UploadVideoRoom(props) {
  const { videoUrl, handleChangeVideo } = props
  return (
    <Row className="mt-2">
      <Col xs="12" md="3" lg="2">
        <Label htmlFor="upload-video" className="label-upload" style={{ cursor: 'pointer' }}>
          {STRING.videoRoom}
          <br />
        </Label>
      </Col>
      <Col xs="12" md="8" lg="9" className="row">
        <div className="upload-form-wrapper col-md-4" style={{ border: '1px solid dotted' }}>
          <label
            htmlFor="upload-video"
            className="label-upload cursor"
            style={{ border: '1px solid dotted', position: 'relative' }}
          >
            {videoUrl ? (
              <>
                <i className="fas fa-times " style={{ position: 'absolute', fontSize: 20, left: '95%' }}></i>
                <video
                  controls
                  src={videoUrl}
                  className="uploaded-pic img-thumbnail "
                  style={{ padding: 14 }}
                  width={310}
                  height={217.5}
                ></video>
              </>
            ) : (
              <>
                <BackgroundVideo />
              </>
            )}
          </label>
          <Input
            type="file"
            className="mb-0"
            id="upload-video"
            placeholder={STRING.video}
            style={{ display: 'none' }}
            accept="video/mp4, video/ogg, video/webm"
            onChange={(e) => {
              props.handleChangeVideo(e)
            }}
          />
        </div>
        <div className="d-flex flex-column justify-content-center col-md-8">
          <p>1. Kích thước: Tối đa 30Mb, độ phân giải không vượt quá 1280x1280px</p>
          <p>2. Độ dài: 10s-60s 3. Định dạng: MP4 (không hỗ trợ vp9)</p>
          <p>3. Định dạng: MP4 (không hỗ trợ vp9)</p>
        </div>
      </Col>
    </Row>
  )
}

export default UploadVideoRoom
