import React from 'react'
export const textError = (text) => {
  return <span style={{ color: 'red' }}>{text}</span>
}

export const textSuccess = (text) => {
  return <span>{text}</span>
}

export const textWarning = (text) => {
  return <span>{text}</span>
}
