import React, { Component } from 'react'
import { FormControl, Nav, Button } from 'react-bootstrap'
import './Header.css'

class SearchInput extends Component {
  render() {
    return (
      <div className="row ">
        {/* <FormControl className="input-search" placeholder="Nhập khu vực" />
        <Nav.Link
          className="dropdown my-2"
          style={{
            marginLeft: '-199px',
            borderLeft: '1px solid #bebebe',
          }}
        >
          <div data-toggle="dropdown" style={{ maxWidth: '150px', alignItems: 'center' }}>
            <a style={{ fontSize: '20px', color: '#6D767D' }}>
              <i className="far fa-user mr-1" />
              <span
                className="mx-1"
                style={{
                  maxWidth: '80px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
              >
                10 người
              </span>
            </a>
          </div>
          <div className="dropdown-menu dropdown-menu-left row mt-3" style={{ borderRadius: '8px' }}>
            <div className="row">
              <div>
                <p className="dropdown-item_text ml-4"> Số người </p>
              </div>
              <div className="row ml-3">
                <div>
                  <span className="px-2 button-plus">-</span>
                </div>
                <div className="mx-1">
                  <FormControl className="header-input_amount" value="100"></FormControl>
                </div>
                <div>
                  <span className="px-2 button-plus">+</span>
                </div>
              </div>
            </div>
          </div>
        </Nav.Link>
        <div>
          <Button className="button-control btn-search">
            <i className="fas fa-search" style={{ fontSize: '22px' }}></i>
          </Button>
        </div> */}
        <div className="d-flex search-form" style={{alignItems: 'center'}}>
          <div>
            <FormControl
              type="text"
              placeholder="Nhập khu vực"
              className="form-search-home"
              // value={modal && modal.address}
              // onChange={(e) => this.modalFieldChange('address', e.target.value)}
            ></FormControl>
          </div>

          <div className="form-counter-user">
            <span className="m-2">
              <i className="fas fa-user icon-user-search"></i>
            </span>
            <span style={{ fontSize: '18px' }} className="mr-2">1 người</span>
            <span>
              <i className="fas fa-search icon-home-search"></i>
            </span>
          </div>
        </div>
      </div>
    )
  }
}

export default SearchInput
