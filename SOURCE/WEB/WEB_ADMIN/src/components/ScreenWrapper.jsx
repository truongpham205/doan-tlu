import React, { Component } from 'react'
import Loading from './TableLoading'
import ScreenError from './ScreenError'
import LoadingData from './Loading'
import './ScreenWrapper.css'
import { Row, Col, FormControl, Table, Button } from 'react-bootstrap'
import { STRING } from 'constants/Constant'
import PropTypes from 'prop-types'

class ScreenWrapper extends Component {
  render() {
    const {
      titleHeader,
      detail,
      isLoading,
      isError,
      isEmpty,
      back,
      renderHeader,
      renderFooter,
      isLoadingAddUpdate,
      paging,
      action,
      context,
      btnAdd,
    } = this.props

    if (isLoadingAddUpdate) {
      return (
        <div className="content-wrapper">
          <LoadingData />
        </div>
      )
    }

    if (isLoading)
      return (
        <div className="content-wrapper">
          <Loading />
        </div>
      )

    if (isError) {
      return <ScreenError isOpen={isError} />
    }

    return (
      <div className="content-wrapper">
        {/* header */}
        {titleHeader && (
          <div className="content-header">
            <div className="container-fluid">
              <div className="row mb-2 box--shadow p-3">{renderHeader()}</div>
            </div>
          </div>
        )}
        <section className="content">
          <div
            className="container-fluid"
            style={{
              marginBottom: 80,
            }}
          >
            {this.props.children}

            {renderFooter()}
          </div>
        </section>
      </div>
    )
  }
}

ScreenWrapper.propTypes = {
  renderFooter: PropTypes.func,
  renderHeader: PropTypes.func,
}

ScreenWrapper.defaultProps = {
  renderFooter: () => {},
  renderHeader: () => {},
}

export default ScreenWrapper
