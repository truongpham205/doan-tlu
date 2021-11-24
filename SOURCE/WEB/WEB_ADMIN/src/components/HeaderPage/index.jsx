import React from 'react'
import PropTypes from 'prop-types'
import { Col, Button } from 'react-bootstrap'
HeaderPage.propTypes = {
  titleHeader: PropTypes.string,
  titleButton: PropTypes.string,
  onClickButton: PropTypes.func,
}

HeaderPage.defaultProps = {
  titleHeader: '',
  titleButton: '',
  onClickButton: () => {},
}

function HeaderPage(props) {
  const { titleHeader, titleButton, onClickButton, context } = props
  return (
    <>
      <Col sm="12" md="6">
        <h2
          className={`m-0 text-dark ${context ? 'header--detail cursor' : ''} `}
          onClick={() => context?.history.goBack()}
        >
          {titleHeader}
        </h2>
      </Col>

      {titleButton && (
        <Col sm="6" className="btn--header">
          <Button className="mr-0 mb-0" onClick={onClickButton}>
            {titleButton}
          </Button>
        </Col>
      )}
      <Col md="6" className="btn--header">
        {props.children}
      </Col>
    </>
  )
}

export default HeaderPage
