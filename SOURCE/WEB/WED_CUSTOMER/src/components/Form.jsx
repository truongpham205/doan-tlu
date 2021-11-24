import React from 'react'
import PropTypes from 'prop-types'
import { ErrorMessage } from '@hookform/error-message'

FormError.propTypes = {}

function FormError(props) {
  const { name, errors, register, validation, placeholder, type } = props

  return (
    <>
      <input
        type={type}
        className="form-control"
        placeholder={placeholder}
        id={name}
        name={name}
        ref={register(validation)}
      />
      <ErrorMessage
        errors={errors}
        name={name}
        render={({ messages }) => {
          return messages
            ? Object.entries(messages).map(([type, message]) => (
                <p style={{ color: 'red' }} key={type}>
                  {message}
                </p>
              ))
            : null
        }}
      />
    </>
  )
}

export default FormError
