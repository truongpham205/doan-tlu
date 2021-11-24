import { Checkbox, Radio } from 'antd'
import { ACCEPT_TYPE, STRING, TYPE_INPUT } from 'constants/Constant'
import React, { PureComponent } from 'react'
import { Button, Col, FormControl, Modal, ModalFooter, Row } from 'react-bootstrap'
// import MultiSelect from 'react-multi-select-component'
import { FormFeedback, Input, Spinner } from 'reactstrap'
import 'styles/UploadImage.css'
import { checkValidationError } from 'utils/checkValidateError'
import formatNumber from 'utils/formatNumber'
import PropTypes from 'prop-types'
import FCTAutocomplete from './autocomplete'

class ModalComponent extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      transferImageUrl: '',
      transferImageSmsUrl: '',
      illustration: '',
      touchedInputText: false,
      touchedInputPassword: false,
      touchedInputTextConvertToNumber: false,
      touchedInputEmail: false,
      touchedInputNumber: false,
      touchedInputDate: false,
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.isOpen !== prevProps.isOpen) {
      this.resetState()
    }
  }

  resetState = () => {
    this.setState({
      transferImageUrl: '',
      transferImageSmsUrl: '',
      illustration: '',
      touchedInputText: false,
      touchedInputPassword: false,
      touchedInputTextConvertToNumber: false,
      touchedInputTextDescription: false,
      touchedInputEmail: false,
      touchedInputNumber: false,
    })
  }

  handleChangeImage = (type, event) => {
    if (!event.target.files[0]) {
      return
    }
    if (!ACCEPT_TYPE.IMAGE.includes(event.target.files[0].type)) {
      alert('Định dạng ảnh không được hỗ trợ. Vui lòng chọn ảnh khác.')
      return
    }
    this.setState({
      [type]: (window.URL || window.webkitURL).createObjectURL(event.target.files[0]),
    })
  }

  renderInputText = (item, index) => {
    const { touchedInputText } = this.state
    return (
      <Row key={index}>
        <Col className="modal-field mb-3" xs={4}>
          <p>
            {item.titleName + ' '}
            <span style={{ color: 'red' }}> * </span>
          </p>
        </Col>
        <Col xs={8}>
          <Input
            type="text"
            className="mb-0"
            disabled={item?.detail}
            placeholder={`${item.titleName}`}
            value={item.value}
            invalid={item.error ? true : false}
            onChange={(e) => {
              this.props.handleInputModal(item.valueName, e.target.value)
              if (touchedInputText) {
                this.props.handleBlur(item.valueName, item.titleName)
              }
            }}
            onBlur={() => {
              if (!touchedInputText) {
                this.setState({
                  ...this.state,
                  touchedInputText: true,
                })
              }
              this.props.handleBlur(item.valueName, item.titleName)
            }}
          />
          {item.error && <FormFeedback>{item.error}</FormFeedback>}
        </Col>
      </Row>
    )
  }

  renderInputTextConvertToNumber = (item, index) => {
    const { touchedInputTextConvertToNumber } = this.state
    return (
      <Row key={index}>
        <Col className="modal-field mb-3" xs={4}>
          <p>
            {item.titleName + ' '}
            <span style={{ color: 'red' }}> * </span>
          </p>
        </Col>
        <Col xs={8}>
          <Input
            type="text"
            className="mb-0"
            disabled={item?.detail}
            placeholder={`${item.titleName}`}
            value={
              item.value
                ? item.value?.toLocaleString('vi', {
                    currency: 'VND',
                  })
                : ''
            }
            invalid={item.error ? true : false}
            onChange={(e) => {
              this.props.handleInputModal(item.valueName, formatNumber(e.target.value))
              if (touchedInputTextConvertToNumber && item.hasOwnProperty('error')) {
                this.props.handleBlur(item.valueName, item.titleName)
              }
            }}
            onBlur={() => {
              if (!touchedInputTextConvertToNumber) {
                this.setState({
                  ...this.state,
                  touchedInputTextConvertToNumber: true,
                })
              }
              if (item.hasOwnProperty('error')) {
                this.props.handleBlur(item.valueName, item.titleName)
              }
            }}
          />
          {item.error && <FormFeedback>{item.error}</FormFeedback>}
        </Col>
      </Row>
    )
  }

  renderInputDescription = (item, index) => {
    const { touchedInputTextDescription } = this.state
    return (
      <Row key={index} className="mb-3">
        <Col className="modal-field mb-3" xs={4}>
          <p>{item.titleName}</p>
        </Col>
        <Col xs={8}>
          <Input
            type="textarea"
            className="mb-0"
            rows={item?.rows || 3}
            invalid={item.error ? true : false}
            disabled={item?.detail}
            placeholder={`${item.titleName}`}
            value={item.value || ''}
            onChange={(e) => {
              this.props.handleInputModal(item.valueName, e.target.value)
              if (touchedInputTextDescription && item.hasOwnProperty('error')) {
                this.props.handleBlur(item.valueName, item.titleName)
              }
            }}
            onBlur={() => {
              if (!touchedInputTextDescription) {
                this.setState({
                  ...this.state,
                  touchedInputTextDescription: true,
                })
              }
              if (item.hasOwnProperty('error')) {
                this.props.handleBlur(item.valueName, item.titleName)
              }
            }}
          />
          {item.error && <FormFeedback>{item.error}</FormFeedback>}
        </Col>
      </Row>
    )
  }

  renderInputEmail = (item, index) => {
    const { touchedInputEmail } = this.state
    return (
      <Row key={index}>
        <Col className="modal-field mb-3" xs={4}>
          <p>
            {item.titleName + ' '}
            <span style={{ color: 'red' }}> * </span>
          </p>
        </Col>
        <Col xs={8}>
          <Input
            type="email"
            className="mb-0"
            disabled={item?.detail}
            placeholder={`${item.titleName}`}
            value={item.value}
            invalid={item.error ? true : false}
            onChange={(e) => {
              this.props.handleInputModal(item.valueName, e.target.value)
              if (touchedInputEmail) {
                this.props.handleBlur(item.valueName, item.titleName)
              }
            }}
            onBlur={() => {
              this.props.handleBlur(item.valueName, item.titleName)
              if (!touchedInputEmail) {
                this.setState({
                  ...this.state,
                  touchedInputEmail: true,
                })
              }
            }}
          />
          {item.error && <FormFeedback>{item.error}</FormFeedback>}
        </Col>
      </Row>
    )
  }

  renderInputCheckBox = (item, index) => {
    return (
      <Row key={index} className="mb-3">
        <Col className="modal-field mb-0" xs={4}>
          {item.titleName}
        </Col>
        <Col xs={8} className="text-left">
          <Checkbox
            disabled={item?.detail}
            className="mr-2"
            checked={item?.value}
            onChange={(e) => {
              this.props.handleInputModal(item.valueName, !item?.value)
            }}
            onBlur={() => this.props.handleBlur(item.valueName, item.titleName)}
          ></Checkbox>
          {item.titleName}
        </Col>
      </Row>
    )
  }

  renderInputNumber = (item, index) => {
    const { touchedInputNumber } = this.state
    return (
      <Row key={index}>
        <Col className="modal-field mb-3" xs={4}>
          <p>
            {item.titleName + ' '}
            <span style={{ color: 'red' }}> * </span>
          </p>
        </Col>
        <Col xs={8}>
          <Input
            type="number"
            disabled={item?.detail}
            placeholder={`${item?.titleName}`}
            onChange={(e) => {
              this.props.handleInputModal(item.valueName, e.target.value)
            }}
            invalid={!!item?.error}
            value={item?.value}
            onBlur={() => {
              this.props.handleBlur(item.valueName, item.titleName)
            }}
          />
          {item?.error && <FormFeedback>{item?.error}</FormFeedback>}
        </Col>
      </Row>
    )
  }

  renderInputPhoneNumber = (item, index) => {
    const { touchedInputNumber } = this.state
    return (
      <Row key={index}>
        <Col className="modal-field mb-3" xs={4}>
          <p>
            {item.titleName + ' '}
            <span style={{ color: 'red' }}> * </span>
          </p>
        </Col>
        <Col xs={8}>
          <Input
            type="tel"
            // disabled={isEditable}
            disabled={item?.detail}
            placeholder={`${item?.titleName}`}
            onChange={(e) => {
              this.props.handleInputModal(item.valueName, e.target.value)
              if (touchedInputNumber) {
                this.props.handleBlur(item.valueName, item.titleName, e.target.value)
              }
            }}
            invalid={!!item?.error}
            value={item?.value}
            onBlur={() => {
              this.props.handleBlur(item.valueName, item.titleName, '')
              if (!touchedInputNumber) {
                this.setState({
                  ...this.state,
                  touchedInputNumber: true,
                })
              }
            }}
          />
          {item?.error && <FormFeedback>{item?.error}</FormFeedback>}
        </Col>
      </Row>
    )
  }

  renderInputPassword = (item, index) => {
    const { touchedInputPassword } = this.state
    return (
      <Row key={index}>
        <Col className="modal-field mb-3" xs={4}>
          <p>
            {item.titleName + ' '}
            <span style={{ color: 'red' }}> * </span>
          </p>
        </Col>
        <Col xs={8}>
          <Input
            type="password"
            className="mb-0"
            // disabled={isEditable}
            placeholder={`${item.titleName}`}
            disabled={item?.detail}
            value={item.value}
            invalid={item.error ? true : false}
            onChange={(e) => {
              this.props.handleInputModal(item.valueName, e.target.value)
              if (touchedInputPassword) {
                this.props.handleBlur(item.valueName, item.titleName)
              }
            }}
            onBlur={() => {
              this.props.handleBlur(item.valueName, item.titleName)
              if (!touchedInputPassword) {
                this.setState({
                  ...this.state,
                  touchedInputPassword: true,
                })
              }
            }}
          />
          {item.error && <FormFeedback>{item.error}</FormFeedback>}
        </Col>
      </Row>
    )
  }

  renderInputDate = (item, index) => {
    const { touchedInputDate } = this.state
    return (
      <Row key={index}>
        <Col className="modal-field mb-3" xs={4}>
          {item.titleName + ' '}
          <span style={{ color: 'red' }}> * </span>
        </Col>
        <Col xs={8}>
          <input
            placeholder={'Ngày CK'}
            className={'form-control'}
            type="date"
            value={item?.value}
            disabled={item?.detail}
          />
        </Col>
      </Row>
    )
  }

  renderInputRadio = (item, index) => {
    return (
      <Row key={index}>
        <Col className="modal-field mb-3" xs={4}>
          <p>
            {item.titleName + ' '}
            <span style={{ color: 'red' }}> * </span>
          </p>
        </Col>
        <Col xs={8}>
          <Radio.Group
            style={{ width: '100%' }}
            value={item.value}
            onChange={(e) => {
              this.props.handleInputModal(item.valueName, e.target.value)
            }}
          >
            <Radio value={2} className="float-left">
              {item?.option1 || 'Chấp nhận'}
            </Radio>
            {!item?.refuse && <Radio value={-1}>{item?.option2 || 'Từ chối'}</Radio>}
          </Radio.Group>
        </Col>
      </Row>
    )
  }

  renderAutocomplete = (item, index) => {
    return (
      <Row key={index}>
        <Col className="modal-field mb-3" xs={4}>
          <p>{item.titleName + ' '}</p>
          <span style={{ color: 'red' }}> * </span>
        </Col>
        <Col xs={8}>
          <FCTAutocomplete
            placeholder={`${item.placeHolder}`}
            value={item?.value?.value}
            onChange={this.props.onChangeAutocomplete}
            onSelect={this.props.onSelectAutocomplete}
            onSearch={this.props.onSearchAutocomplete}
            listOption={item.listOptionAutocomplete}
          ></FCTAutocomplete>
        </Col>
      </Row>
    )
  }

  renderField = (item, index) => {
    const { transferImageUrl, transferImageSmsUrl, illustration } = this.state
    switch (item.type) {
      case TYPE_INPUT.text:
        return this.renderInputText(item, index)

      case TYPE_INPUT.textConvertToNumber:
        return this.renderInputTextConvertToNumber(item, index)

      case TYPE_INPUT.text_description:
        return this.renderInputDescription(item, index)

      case TYPE_INPUT.email:
        return this.renderInputEmail(item, index)

      case TYPE_INPUT.phoneNumber:
        return this.renderInputPhoneNumber(item, index)

      case TYPE_INPUT.date:
        return this.renderInputDate(item, index)

      case TYPE_INPUT.file_front:
        return (
          <Row key={index}>
            <Col className="modal-field" xs={4}>
              <p>
                {item.titleName + ' '}
                <span style={{ color: 'red' }}> * </span>
              </p>
            </Col>
            <Col xs={8}>
              <div className="upload-form-wrapper text-left" style={{ border: '1px solid dotted' }}>
                <label htmlFor="upload-front_img" className="label-upload" style={{ cursor: 'pointer' }}>
                  {item.url ? (
                    <>
                      <img
                        src={item.url}
                        className="uploaded-pic img-thumbnail"
                        style={{ maxWidth: '100%' }}
                        alt="Ảnh CK"
                      />
                    </>
                  ) : (
                    <>
                      <i className="fas fa-image upload-icon mt-0" style={{ fontSize: '36px' }}></i>
                      <br />
                    </>
                  )}
                </label>
                <Input
                  type="file"
                  className="mb-0"
                  id="upload-front_img"
                  placeholder={`${item.titleName}`}
                  style={{ display: 'none' }}
                  accept=".jpg,.jpeg,.png, .webp"
                  disabled={item?.detail}
                  invalid={item?.error ? true : false}
                  onChange={(e) => {
                    this.props.handleIdCard(item?.valueName, item?.urlName, e)
                    // this.handleChangeImage('transferImageUrl', e)
                  }}
                />
              </div>

              {item?.error && <FormFeedback>{item?.error}</FormFeedback>}
            </Col>
          </Row>
        )

      case TYPE_INPUT.file_back:
        return (
          <Row key={index}>
            <Col className="modal-field" xs={4}>
              <p>
                {item.titleName + ' '}
                <span style={{ color: 'red' }}> * </span>
              </p>
            </Col>
            <Col xs={8}>
              <div className="upload-form-wrapper text-left" style={{ border: '1px solid dotted' }}>
                <label htmlFor="upload-back_img" className="label-upload" style={{ cursor: 'pointer' }}>
                  {item.url ? (
                    <>
                      <img
                        src={item.url}
                        className="uploaded-pic img-thumbnail"
                        style={{ maxWidth: '100%' }}
                        alt="Ảnh CK"
                      />
                    </>
                  ) : (
                    <>
                      <i className="fas fa-image upload-icon mt-0" style={{ fontSize: '36px' }}></i>
                      <br />
                    </>
                  )}
                </label>
                <Input
                  type="file"
                  className="mb-0"
                  id="upload-back_img"
                  placeholder={`${item.titleName}`}
                  style={{ display: 'none' }}
                  accept=".jpg,.jpeg,.png, .webp"
                  // disabled={item.detail}
                  invalid={item.error ? true : false}
                  onChange={(e) => {
                    this.props.handleIdCard(item.valueName, item.urlName, e)
                    // this.handleChangeImage('transferImageUrl', e)
                  }}
                />
              </div>

              {item.error && <FormFeedback>{item.error}</FormFeedback>}
            </Col>
          </Row>
        )

      case TYPE_INPUT.illustration:
        return (
          <Row key={index}>
            <Col className="modal-field" xs={4}>
              <p>{item.titleName + ' '}</p>
            </Col>
            <Col xs={8}>
              <div className="upload-form-wrapper text-left" style={{ border: '1px solid dotted' }}>
                <label htmlFor="upload-front_img" className="label-upload" style={{ cursor: 'pointer' }}>
                  {item?.edit && !illustration?.length && item?.url ? (
                    <>
                      <img
                        src={item?.url}
                        className="uploaded-pic img-thumbnail"
                        style={{ maxWidth: '100%' }}
                        alt="Ảnh minh họa"
                      />
                    </>
                  ) : illustration?.length ? (
                    <>
                      <img
                        src={illustration}
                        className="uploaded-pic img-thumbnail"
                        style={{ maxWidth: '100%' }}
                        alt="Ảnh minh họa"
                      />
                    </>
                  ) : (
                    <>
                      <i className="fas fa-image upload-icon my-0" style={{ fontSize: '36px' }}></i>
                      <br />
                    </>
                  )}
                </label>

                <Input
                  type="file"
                  className="mb-0"
                  id="upload-front_img"
                  placeholder={`${item.titleName}`}
                  // value={item.value}
                  style={{ display: 'none' }}
                  accept=".jpg,.jpeg,.png, .webp"
                  invalid={item.error ? true : false}
                  onChange={(e) => {
                    this.props.handleIdCard(item.valueName, e)
                    this.handleChangeImage(item.valueName, e)
                  }}
                  onBlur={() => this.props.handleBlur(item.valueName, item.titleName)}
                />
              </div>

              {item.error && <FormFeedback>{item.error}</FormFeedback>}
            </Col>
          </Row>
        )

      case TYPE_INPUT.select:
        return (
          <Row key={index}>
            <Col className="modal-field mb-3" xs={4}>
              <p>
                {item?.titleName + ' '}
                <span style={{ color: 'red' }}> * </span>
              </p>
            </Col>
            <Col xs={8}>
              <FormControl
                as="select"
                aria-describedby="basic-addon1"
                disabled={item?.detail}
                value={item?.value}
                onChange={(e) => this.props.handleInputModal(item.valueName, e.target.value)}
              >
                <option value="" defaultValue>
                  {item?.titleName}
                </option>
                {item?.list?.length
                  ? item?.list?.map((elm, index) => (
                      <option value={elm?.id} key={index}>
                        {elm?.name || elm.full_name}
                      </option>
                    ))
                  : ''}
              </FormControl>
            </Col>
          </Row>
        )

      case TYPE_INPUT.number:
        return this.renderInputNumber(item, index)

      case TYPE_INPUT.passWord:
        return this.renderInputPassword(item, index)

      case TYPE_INPUT.checkbox:
        return this.renderInputCheckBox(item, index)

      case TYPE_INPUT.radio:
        return this.renderInputRadio(item, index)

      case TYPE_INPUT.autoComplete:
        return this.renderAutocomplete(item, index)
      default:
        break
    }
  }

  render() {
    const { allField } = this.props
    return (
      <Modal
        show={this.props.isOpen}
        onHide={() => {
          this.props.onHide()
          this.resetState()
        }}
        size={this.props.size}
        dialogClassName="modal-100w"
        aria-labelledby="example-custom-modal-styling-title"
        centered
      >
        <Modal.Header closeButton>
          <h5 style={{ color: 'white' }} className="modal-title">
            {this.props.title}
          </h5>
        </Modal.Header>
        <Modal.Body className="custom-body">{allField.map((item, index) => this.renderField(item, index))}</Modal.Body>
        <ModalFooter>
          {/* <Row className="mt-3"> */}
          <Col className="button-wrapper">
            <Button
              className="mb-0"
              variant="success"
              onClick={this.props.addUpdate}
              disabled={checkValidationError(this.props.checkValidateError) || this.props.checkValidateValue}
            >
              {this.props?.showSpinner ? <Spinner color="light" size="sm" className="mr-1" /> : ''}
              {STRING.save}
            </Button>
            <Button
              className="mb-0"
              variant="primary"
              onClick={() => {
                this.props.onHide()
                this.resetState()
              }}
            >
              {STRING.exit}
            </Button>
          </Col>
          {/* </Row> */}
        </ModalFooter>
      </Modal>
    )
  }
}
ModalComponent.propTypes = {
  allField: PropTypes.array,
}

ModalComponent.defaultProps = {
  allField: [],
}

export default ModalComponent
