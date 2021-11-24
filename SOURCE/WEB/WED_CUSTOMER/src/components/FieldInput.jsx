import React from 'react'
import { Row, Col, Button } from 'react-bootstrap'

const FieldInput = ({ fieldName, validateError }) => {
  switch (fieldName) {
    case STRING.licensePlate:
      return (
        <Row>
          <Col className="modal-field" sm={4}>
            <span>{fieldName}</span>
          </Col>
          <Col sm={8}>
            <FormControl
              disabled={isEditable}
              aria-describedby="basic-addon1"
              placeholder={`Nhập ${fieldName.toLowerCase()}`}
              onChange={(e) => this.handleChangeFieldModal(fieldName, e.target.value)}
              value={field}
              onBlur={() => {
                validateForm(this, field, fieldName)
              }}
            />
            {fieldError && <span className="validation-error">{fieldError}</span>}
          </Col>
        </Row>
      )
    case STRING.transportType:
      return (
        <Row>
          <Col className="modal-field" sm={4}>
            <span>{fieldName}</span>
          </Col>
          <Col sm={8}>
            <FormControl
              as="select"
              aria-describedby="basic-addon1"
              value={field}
              onChange={(e) => {
                this.handleChangeFieldModal(STRING.transportType, e.target.value)
              }}
            >
              <option defaultValue value="">
                {STRING.transportType}
              </option>
              {this.props.transportTypeState?.data?.map((carType, index) => (
                <option value={carType.ID} key={index}>
                  {carType.CONTENT}
                </option>
              ))}
            </FormControl>
          </Col>
        </Row>
      )
    case STRING.route:
      return (
        <Row>
          <Col className="modal-field" sm={4}>
            <span>{fieldName}</span>
          </Col>
          <Col sm={8}>
            <FormControl
              as="select"
              aria-describedby="basic-addon1"
              onChange={(e) => {
                this.handleChangeFieldModal(STRING.route, e.target.value)
              }}
              value={field}
            >
              <option value="" selected>
                {STRING.route}
              </option>
              {this.state.transportProviderRoute?.map((route) => (
                <option value={route.ROUTE_ID}>
                  {route.ROUTE.START_POINT?.NAME} - {route.ROUTE.END_POINT?.NAME}
                </option>
              ))}
            </FormControl>
          </Col>
        </Row>
      )
    default:
      return (
        <Row>
          <Col className="modal-field" sm={4}>
            <span>{fieldName}</span>
          </Col>
          <Col sm={8}>
            <FormControl
              aria-describedby="basic-addon1"
              placeholder={`Nhập ${fieldName.toLowerCase()}`}
              onChange={(e) => this.handleChangeFieldModal(fieldName, e.target.value)}
              value={field}
              onBlur={() => {
                validateForm(this, field, fieldName)
              }}
            />
            {fieldError && <span className="validation-error">{fieldError}</span>}
          </Col>
        </Row>
      )
  }
}

export default FieldInput
