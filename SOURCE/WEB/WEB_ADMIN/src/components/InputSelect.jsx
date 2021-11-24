import React from 'react'
import { FormControl } from 'react-bootstrap'
const InputSelect = ({ listItem, handleChange }) => {
  return (
    <>
      {listItem?.map((items, index) => (
        <div className="col-12 col-md-4 row">
          <div className="col-4">
            <span>{items.titleName}</span>
          </div>
          <div className="col-8">
            <FormControl
              key={index}
              as="select"
              aria-describedby="basic-addon1"
              value={items.value}
              onChange={(e) => handleChange(items.valueName, e.target.value)}
            >
              <option value="" defaultValue>
                {items.titleName}
              </option>
              {items.subItem?.map((item, index) => (
                <option value={item.value} key={index}>
                  {item.lable}
                </option>
              ))}
            </FormControl>
          </div>
        </div>
      ))}
    </>
  )
}
export default InputSelect
