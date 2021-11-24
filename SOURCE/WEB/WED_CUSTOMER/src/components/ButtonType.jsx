import React from 'react'
import { Row, Col, Button } from 'react-bootstrap'

const ButtonType = ({ typeButton }) => {
  console.log(typeButton)
  return (
    <Button variant={typeButton.variant}>
      {typeButton.lable}
    </Button>
  )
}

export default ButtonType
