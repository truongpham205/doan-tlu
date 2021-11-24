import React, { PureComponent } from 'react'
import { Input, FormFeedback } from 'reactstrap'
import { Row, Col, FormControl, Button } from 'react-bootstrap'
import { STRING, TYPE_INPUT } from '@constants/Constant'
import reactotron from 'src/debug/ReactotronConfig'
import Select from 'react-select'
import '../components/recruitmentComponents/Register/RegisterComponent.css'

class ModalComponent extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {}
  }
  renderField = (item) => {
    switch (item.type) {
      case TYPE_INPUT.total_type:
        return (
          <div class="form-group row">
            <label class="control-label col-md-3">
              {item.titleName + ' '}
              <span class="text-danger">*</span>
            </label>
            <div class="col-md-5 pr-0">
              <div className="col-12 pl-0 btn--search" style={{ paddigRight: 100 }}>
                <span className="ctn-icon">
                  <i className="fas fa-map-marker-alt m-0 p-0" style={{ fontSize: 17 }}></i>
                </span>
                <Select
                  value={item.value_province}
                  options={item.valueProvinces}
                  placeholder={`--${STRING.choose_province}--`}
                  onChange={(e) => this.props.handleChangeSelect(item.valueName_province, e)}
                />
              </div>
              {item.error && <FormFeedback>{item.error}</FormFeedback>}
            </div>
            <div class="col-md-4 pr-0">
              <div className="col-12 pl-0 btn--search" style={{ paddigRight: 100 }}>
                <span className="ctn-icon">
                  <i className="fas fa-map-marker-alt m-0 p-0" style={{ fontSize: 17 }}></i>
                </span>
                <Select
                  value={item.value_district}
                  options={item.valueDistricts}
                  placeholder={`--${STRING.choose_district}--`}
                  onChange={(e) => this.props.handleChangeSelect(item.valueName_district, e)}
                />
              </div>
              {item.error && <FormFeedback>{item.error}</FormFeedback>}
            </div>
          </div>
        )
      case TYPE_INPUT.select:
        return (
          <div class="form-group row">
            <label class="control-label col-md-3">
              {item.titleName + ' '}
              <span class="text-danger">*</span>
            </label>
            <div class="col-md-9">
              <FormControl
                as="select"
                className="mb-0"
                // disabled={isEditable}
                placeholder={`${item.titleName}`}
                value={item.value}
                invalid={item.error ? true : false}
                onChange={(e) => {
                  this.props.handleInputModal(item.valueName, e.target.value)
                }}
                onBlur={() => this.props.handleBlur(item.valueName, item.titleName)}
              >
                <option value="" defaultValue>
                  --{item.titleName}--
                </option>
                {item.valueArray?.map((e, index) => (
                  <option value={e.value} key={index}>
                    {e.label}
                  </option>
                ))}
              </FormControl>
              {item.error && <FormFeedback>{item.error}</FormFeedback>}
            </div>
          </div>
        )
      case TYPE_INPUT.number:
        return (
          <div class="form-group row">
            <label class="control-label col-md-3">
              {item.titleName + ' '}
              <span class="text-danger">*</span>
            </label>
            <div class="col-md-9">
              <input
                type="number"
                className="mb-0 form-control"
                // disabled={isEditable}
                placeholder={`${item.titleName}`}
                value={item.value}
                invalid={item.error ? true : false}
                onChange={(e) => {
                  this.props.handleInputModal(item.valueName, e.target.value)
                }}
                onBlur={() => this.props.handleBlur(item.valueName, item.titleName)}
              />
              {item.error && <FormFeedback>{item.error}</FormFeedback>}
            </div>
          </div>
        )
      default:
        return (
          <div class="form-group row">
            <label class="control-label col-md-3">
              {item.titleName + ' '}
              <span class="text-danger">*</span>
            </label>
            <div class="col-md-9">
              <input
                type="text"
                className="mb-0 form-control"
                // disabled={isEditable}
                placeholder={`${item.titleName}`}
                value={item.value}
                invalid={item.error ? true : false}
                onChange={(e) => {
                  this.props.handleInputModal(item.valueName, e.target.value)
                }}
                onBlur={() => this.props.handleBlur(item.valueName, item.titleName)}
              />
              {item.error && <FormFeedback>{item.error}</FormFeedback>}
            </div>
          </div>
        )
    }
  }

  render() {
    return <>{this.props.allField?.map((item) => this.renderField(item))}</>
  }
}

export default ModalComponent
