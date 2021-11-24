import React, { Component } from 'react'
import CreditCard from '../../../assets/credit-card.png'
import visa from '../../../assets/visa.png'
import InternetBanking from '../../../assets/internet-banking.png'
import './Footer.css'
import { Tooltip } from '@material-ui/core'
class PaymentComponent extends Component {
  render() {
    return (
      <div style={{ marginTop: '20px' }}>
        <div id="menu-payment">
          <ui>
            <li>
              <Tooltip title="Visa">
                <img src={visa} alt="visa" />
              </Tooltip>
            </li>
            <li>
              <Tooltip title="Master Card">
                <img src={CreditCard} alt="masterCard" />
              </Tooltip>
            </li>
            <li>
              <Tooltip title="Internet Banking">
                <img src={InternetBanking} alt="Internet Banking" />
              </Tooltip>
            </li>
          </ui>
        </div>
      </div>
    )
  }
}

export default PaymentComponent
