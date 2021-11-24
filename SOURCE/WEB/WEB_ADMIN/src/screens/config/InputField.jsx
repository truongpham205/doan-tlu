import React from 'react'
import PropTypes from 'prop-types'
import { Col, FormGroup, Label, Input } from 'reactstrap'

InputField.propTypes = {
  field: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,

  type: PropTypes.string,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool,
}

InputField.defaultProps = {
  text: '',
  label: '',
  placeholder: '',
  disabled: false,
  type: 'text',
  isLoading: false,
}

function InputField(props) {
  const { field, label, placeholder, disabled, type, form } = props
  const { name } = field
  const { errors, touched } = form
  const showError = errors[name] && touched[name]
  return (
    <FormGroup row>
      {label && (
        <Label sm={3} for={name}>
          {label}
        </Label>
      )}
      <Col sm={9}>
        <Input id={name} {...field} placeholder={placeholder} disabled={disabled} type={type} />
        {showError && (
          <p
            style={{
              color: 'red',
            }}
          >
            {errors[name]}
          </p>
        )}
      </Col>
    </FormGroup>

    // <FormGroup row>
    //   <Label for="exampleEmail" sm={2}>
    //     *Tên sản phẩm
    //   </Label>
    //   <Col sm={10}>
    //     <Input type="email" name="email" id="exampleEmail" placeholder="Tên sản phẩm" />
    //   </Col>
    // </FormGroup>
  )
}

export default InputField
