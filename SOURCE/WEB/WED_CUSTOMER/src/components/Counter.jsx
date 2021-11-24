import React from 'react'
import PropTypes from 'prop-types'

Counter.propTypes = {}

function Counter(props) {
  const { handleDecrement, handleIncrement, value } = props
  return (
    <div className="d-flex">
      <span>
        <i className="fas fa-minus counter-icon" onClick={handleDecrement}></i>
      </span>
      <span>
        <h5>{value}</h5>
      </span>
      <span>
        <i className="fas fa-plus counter-icon" onClick={handleIncrement}></i>
      </span>
    </div>
  )
}

export default Counter
