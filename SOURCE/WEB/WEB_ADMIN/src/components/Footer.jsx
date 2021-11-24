import React from 'react'
import PropTypes from 'prop-types'
import { STRING } from 'constants/Constant'
import { Form, FormGroup, Label, Input, Button } from 'reactstrap'
import './Footer.css'
const Footer = (props) => {
  const styles = {
    footer: {
      alignItems: 'center',
      justifyContent: 'flex-end',
      boxShadow: '',
    },
    line: {
      width: '100%',
      height: '1px',
      background: 'gray',
    },
  }
  return (
    <footer className={props.showFooter ? 'show--footer footer' : 'footer'}>
      <div style={styles.footer}>
        <Form>
          <FormGroup check inline>
            <Label check className="mt-1">
              <Input type="checkbox" className="cursor" checked={props.checkAll} onChange={props.handleCheckAll} /> Chọn
              {STRING.all}
            </Label>
          </FormGroup>

          {props.hasEdit ? (
            <Button className="btn btn-info btn-sm mb-0" onClick={props.handleOnEdit}>
              <i className="fas fa-pencil-alt mr-1"></i>
              {STRING.edit}
            </Button>
          ) : (
            ''
          )}

          <Button
            style={{
              margin: 5,
              marginRight: 30,
              paddingLeft: 3,
              paddingRight: 3,
            }}
            type="button"
            className="btn-danger py-1 px-1 btn-sm"
            onClick={props.delete}
          >
            <i className="fas fa-trash" /> {STRING.delete}
          </Button>
        </Form>
      </div>
    </footer>
  )
}

Footer.propTypes = {
  handleOnEdit: PropTypes.func,
  handleCheckAll: PropTypes.func,
  delete: PropTypes.func,
  checkAll: PropTypes.bool,
  showFooter: PropTypes.bool,
  hasEdit: PropTypes.bool,
}

Footer.defaultProps = {
  handleOnEdit: () => {},
  handleCheckAll: () => {},
  delete: () => {},
  checkAll: false,
  showFooter: false,
  hasEdit: false,
}

export default Footer
