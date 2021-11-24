import EmptyData from 'components/EmptyData'
import { STRING } from 'constants/Constant'
import PropTypes from 'prop-types'
import React, { useRef } from 'react'
import { saveAs } from 'file-saver'
import { Image } from 'antd'
import { Input, Button, Col, Row, Modal, ModalHeader, ModalBody, ModalFooter, Table, Spinner } from 'reactstrap'
import { useParams } from 'react-router-dom'
import { requestGetExportCustomer } from 'constants/Api'

CustomerList.propTypes = {
  listCustomer: PropTypes.array,
  visible: PropTypes.bool,
  onHideModal: PropTypes.func,
}
CustomerList.defaultProps = {
  listCustomer: [],
  visible: false,
  onHideModal: null,
}

const ComponentToPrint = React.forwardRef((props, ref) => (
  <div id="export__excel">
    <table className="table table-bordered table-striped table-responsive-md" ref={ref} bordered>
      <thead>
        <tr>
          <th>stt</th>
          <th>Họ và tên</th>
          <th>Số CMND</th>
          <th>Tuổi</th>
          <th>Ảnh CMND mặt trước</th>
          <th>Ảnh CMND mặt sau</th>
        </tr>
      </thead>
      <tbody>
        {props.data.length ? (
          props.data.map((customer, index) => (
            <tr key={index}>
              <th scope="row">{index + 1}</th>
              <td>
                {customer?.name}
                <br />
              </td>
              <td>
                {customer?.identify || '--'}
                {customer.type === 2 && customer?.identify && ` (${STRING.age})`}
              </td>
              <td>{customer?.old ? `${customer.old} (tuổi)` : '--'}</td>
              <td>
                {customer?.font_id ? <Image style={{ width: 110, height: 78 }} src={customer?.font_id} /> : 'Trống'}
              </td>
              <td>
                {customer?.back_id ? <Image style={{ width: 110, height: 78 }} src={customer?.back_id} /> : 'Trống'}
              </td>
            </tr>
          ))
        ) : (
          <EmptyData />
        )}
      </tbody>
    </table>
  </div>
))

function CustomerList(props) {
  const { visible, listCustomer, onHideModal } = props
  const [isLoading, setIsLoading] = React.useState(false)
  const { id } = useParams()
  const downloadRef = useRef()

  const downloadFile = async () => {
    try {
      setIsLoading(true)
      const res = await requestGetExportCustomer(id)
      saveAs(res.data, `${Date.now()}.xlsx`)
    } catch (error) {
      console.log(error)
    }
    setIsLoading(false)
  }

  return (
    <>
      <Modal isOpen={visible} toggle={onHideModal} centered size="lg">
        <ModalHeader toggle={onHideModal} style={{ color: 'white' }}>
          Danh sách khách hàng
        </ModalHeader>
        <ModalBody>
          <ComponentToPrint ref={downloadRef} data={listCustomer} />
        </ModalBody>

        {(listCustomer?.length || '') && (
          <ModalFooter>
            <Button color="primary" onClick={downloadFile}>
              {isLoading && <Spinner size="sm" style={{ marginRight: 5 }} />}
              Download File
            </Button>
          </ModalFooter>
        )}
      </Modal>
    </>
  )
}

export default React.memo(CustomerList)
