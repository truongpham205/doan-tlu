import React from 'react'
import { Row, Col, Button } from 'react-bootstrap'
const ButtonType = ({ typeButton, isOpen, style }) => {

  return (
    <Button variant={typeButton.variant} onClick={isOpen} id="button" style={style}>
      {typeButton.lable}
    </Button>
  )
}

export default ButtonType
