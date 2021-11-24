import React, { PureComponent } from 'react'
import { Row, Col, FormControl, Button, Modal } from 'react-bootstrap'
import { STRING } from 'constants/Constant'
const ConfirmModal = ({ isOpen, title, action, onHide }) => {
  return (
    <Modal
      show={isOpen}
      onHide={onHide}
      dialogClassName="modal-90w"
      aria-labelledby="example-custom-modal-styling-title"
      centered
    >
      <Modal.Header closeButton>
        <h5 style={{ color: 'white' }}>Bạn chắc chắn muốn {title} ?</h5>
      </Modal.Header>
      <Modal.Body className="custom-body">
        <Row>
          <Col className="button-wrapper">
            <Button variant="success" onClick={action}>
              OK
            </Button>
            <Button variant="primary" onClick={onHide}>
              {STRING.exit}
            </Button>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  )
}
export default ConfirmModal
