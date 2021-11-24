import PropTypes from 'prop-types'
import React from 'react'
import Select from 'react-select'
import { FormGroup, Label, Row, Col } from 'reactstrap'

SelectField.propTypes = {
  field: PropTypes.object,
  form: PropTypes.object,
  selectedOption: PropTypes.string || PropTypes.object,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  valueName: PropTypes.string,
  disabled: PropTypes.bool,
  options: PropTypes.array,
  onSelectChange: PropTypes.func,
}

SelectField.defaultProps = {
  label: '',
  placeholder: '',
  valueName: '',
  disabled: false,
  options: [],
  onSelectChange: null,
  selectedOption: { value: '', label: '' },
}

function SelectField(props) {
  const { field, options, label, placeholder, disabled, form, selectedOption, onSelectChange, valueName } = props
  // const { name, value } = field
  // const selectedOption = options.find((option) => option.value === value)
  const handleSelectedOptionChange = (currentOption) => {
    if (!onSelectChange) return
    onSelectChange(valueName, currentOption)
  }
  return (
    <Select
      isClearable={true}
      isSearchable={true}
      value={selectedOption}
      onChange={handleSelectedOptionChange}
      placeholder={placeholder}
      isDisabled={disabled}
      options={options}
    />
  )
}

export default SelectField
