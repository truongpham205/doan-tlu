import React, { PureComponent } from 'react'

export default class CardComponent extends PureComponent {
  render() {
    const { title, isCollapse } = this.props
    return (
      <div className="card card-primary">
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
          <div className="card-tools">
            {isCollapse ? (
              <button type="button" className="btn btn-tool" data-card-widget="collapse" title="Collapse">
                <i className="fas fa-minus" />
              </button>
            ) : (
              ''
            )}
          </div>
        </div>
        {/* card-header */}
        <div className="card-body">{this.props.children}</div>
        {/* /.card-body */}
      </div>
    )
  }
}
