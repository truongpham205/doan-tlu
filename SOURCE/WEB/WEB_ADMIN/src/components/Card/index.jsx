import React from 'react'
import PropTypes from 'prop-types'
import { Checkbox } from 'antd'
import './Card.css'

Card.propTypes = {
  title: PropTypes.string,
  onDelete: PropTypes.func,
  onUpdate: PropTypes.func,
  provider: PropTypes.object,
}

Card.defaultProps = {
  title: 'Add prop title in Card',
  onDelete: null,
  onUpdate: () => {},
  provider: {},
}

function Card(props) {
  const { title, onDelete, onUpdate, provider } = props
  return (
    <div className="card card-primary">
      <div className="card-header border-0">
        <h2 className="card-title">
          {title} <i className="fas fa-trash-alt ml-2 cursor" style={{ color: '#e85e6c' }} onClick={onDelete}></i>
        </h2>

        {provider?.provider_type_id === 2 && (
          <div className="card-tools">
            <Checkbox
              checked={provider?.is_payment}
              disabled={provider?.is_payment}
              onChange={() => onUpdate(provider?.id)}
              className="mr-1"
            />
            <span style={{ color: '#dc3545', fontWeight: 600 }}>Thu nốt tiền khách hàng thanh toán</span>
            {/* <button type="button" className="btn btn-tool" data-card-widget="collapse" title="Collapse">
            <i className="fas fa-minus"></i>
          </button> */}
          </div>
        )}
      </div>
      <div className="card-body p-0">{props.children}</div>
    </div>
  )
}

export default Card
