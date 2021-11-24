import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Button, Col, Row } from 'react-bootstrap'
import { Input, AutoComplete } from 'antd'
import { STRING } from 'constants/Constant'
import SelectField from 'components/SelectField'
import * as ProviderTypeApi from 'network/ProviderTypeApi'
import * as ProviderApi from 'network/ProviderApi'
import * as TourApi from 'network/TourApi'
import { notifyFail, notifySuccess } from 'utils/notify'
ChooseProvider.propTypes = {
  orderId: PropTypes.string,
  getData: PropTypes.func,
  onAddProvider: PropTypes.func,
}
ChooseProvider.defaultProps = {
  orderId: '',
  getData: null,
  onAddProvider: null,
}

function ChooseProvider(props) {
  const { orderId, getData, onAddProvider } = props
  const [providerTypeList, setProviderTypeList] = useState([])
  const [providerTypeId, setProviderTypeId] = useState('')
  const [providerList, setProviderList] = useState([])
  const [providerId, setProviderId] = useState('')

  useEffect(() => {
    getListProviderType()
  }, [])

  useEffect(() => {
    getListProvider(providerTypeId?.value)
  }, [providerTypeId?.value])

  const addProvider = async () => {
    if (!providerId?.value) {
      notifyFail('Vui lòng chọn nhà cung cấp!')
      return
    }

    try {
      const payload = {
        order_id: orderId ? parseInt(orderId) : null,
        provider_id: providerId?.value,
      }
      if (onAddProvider) onAddProvider()
      await TourApi.addProvider(payload)
      notifySuccess('Thêm nhà cung cấp thành công!')
      if (getData) getData()
    } catch (error) {
      console.log(error)
    }
  }

  const getListProviderType = async () => {
    try {
      const listProviderType = await ProviderTypeApi.getListProviderType()
      let options = listProviderType.data.map((providerType) => ({
        value: providerType.id,
        label: providerType.name,
      }))
      setProviderTypeList(options)
    } catch (error) {
      console.log(error)
    }
  }

  const getListProvider = async (providerTypeId) => {
    try {
      const payload = {
        provider_type_id: providerTypeId ? parseInt(providerTypeId) : '',
      }
      const res = await ProviderApi.getListProvider(payload)
      let options = res.data.map((provider) => ({
        value: provider.id,
        label: provider.provider_name,
      }))
      setProviderList(options)
    } catch (error) {
      console.log(error)
    }
  }

  const handleChangeSelect = (fieldName, value) => {
    if (fieldName === 'providerTypeId') {
      setProviderTypeId(value)
    } else {
      setProviderId(value)
    }
  }

  return (
    <Row className="mt-3">
      <Col md="2" className="pl-3 mb-3">
        Chọn nhà cung cấp
      </Col>
      <Col md="3" className="mb-3">
        <SelectField
          options={providerTypeList}
          placeholder={STRING.supplierTypeFull}
          selectedOption={providerTypeId}
          valueName={'providerTypeId'}
          onSelectChange={handleChangeSelect}
        />
      </Col>
      <Col md="3" className="mb-3">
        <SelectField
          options={providerList}
          placeholder={STRING.supplier}
          selectedOption={providerId}
          valueName={'providerId'}
          onSelectChange={handleChangeSelect}
        />
      </Col>
      <Col md="4" className="mb-3">
        <Button color="primary" onClick={addProvider}>
          Chọn
        </Button>
      </Col>
    </Row>
  )
}

export default ChooseProvider
