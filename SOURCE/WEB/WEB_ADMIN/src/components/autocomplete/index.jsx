import React from 'react'
import PropTypes from 'prop-types'
import { Input, AutoComplete } from 'antd'

Autocomplete.propTypes = {
  placeholder: PropTypes.string,
  iconSize: PropTypes.string,
  listOption: PropTypes.array,
  onSelect: PropTypes.func,
  onSearch: PropTypes.func,
  onChange: PropTypes.func,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

Autocomplete.defaultProps = {
  placeholder: '',
  iconSize: 'large',
  listOption: [],
  onSelect: () => {},
  onSearch: () => {},
  onChange: () => {},
  value: '',
}
const { Option } = AutoComplete

function Autocomplete(props) {
  const { placeholder, iconSize, listOption, onSelect, onSearch, onChange, value } = props
  return (
    <div>
      <AutoComplete
        dropdownClassName="certain-category-search-dropdown"
        dropdownMatchSelectWidth={500}
        value={value}
        options={listOption}
        style={{ width: '100%' }}
        onSelect={onSelect}
        onSearch={onSearch}
        onChange={onChange}
      >
        <Input size={iconSize} placeholder={placeholder} />
        {listOption.map((item, index) => (
          <Option value={item?.value} key={index}>
            {item?.value}
          </Option>
        ))}
      </AutoComplete>
    </div>
  )
}

export default Autocomplete
