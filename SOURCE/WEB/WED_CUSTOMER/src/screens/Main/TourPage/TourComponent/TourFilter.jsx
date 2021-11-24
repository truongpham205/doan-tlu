import { COLOR, ROUTER, STRING } from '@constants/Constant'
import filterApi from '@networks/filterApi'
import serviceApi from '@networks/serviceApi'
import { Checkbox } from 'antd'
import React, { useEffect, useState } from 'react'
import { Button, Row } from 'react-bootstrap'
import { useParams } from 'react-router-dom'
import swal from 'sweetalert'
import '../TourPage.css'


const TourFilter = (props) => {
  const { getListService, handleChangeRegion, handleChangeService } = props
  const params = useParams()
  const [cates, setCates] = useState([])
  const [locations, setLocations] = useState([])

  const getListCate = async () => {
    try {
      const res = await serviceApi.listCate({ search: '', is_active: '' })
      setCates(res.data)
    } catch (err) {
      swal('Thất bại', `${err.msg}`, 'error')
    }
  }

  const getListLocation = async () => {
    try {
      const res = await filterApi.regions({ search: '' })
      setLocations(res.data)
    } catch (err) {
      swal('Thất bại', `${err.msg}`, 'error')
    }
  }

  useEffect(() => {
    getListCate()
    getListLocation()
  }, [])

  return (
    <div className="mx-0">
      <div className="tour-ques">
        <span>{STRING.maybeNeed}</span>
      </div>
      {window.location.pathname.search(ROUTER.TOUR_PAGE) == -1 && (
        <div className="tour-filter">
          <span className="tour-filter-title">{STRING.region}</span>
          <div>
            <Checkbox.Group style={{ width: '100%' }} onChange={(e) => handleChangeRegion(e)}>
              {locations?.length > 0 &&
                locations?.map((value) => (
                  <Row className="mt-2">
                    <Checkbox value={value?.id} className="mr-1"></Checkbox>
                    <div>{value?.name || 'Chưa cập nhật'}</div>
                  </Row>
                ))}
            </Checkbox.Group>
          </div>
        </div>
      )}
      {window.location.pathname.search(ROUTER.SERVICE_DETAIL) == -1 && (
        <div className="tour-filter">
          <span className="tour-filter-title">Loại hình</span>
          <div>
            <Checkbox.Group style={{ width: '100%' }} onChange={(e) => handleChangeService(e)}>
              {cates?.length > 0 &&
                cates?.map((value) => (
                  <Row className="mt-2">
                    <Checkbox value={value?.id} className="mr-1"></Checkbox>
                    <div>{value?.name || 'Chưa cập nhật'}</div>
                  </Row>
                ))}
            </Checkbox.Group>
          </div>
        </div>
      )}
      <div className="block-btn-clear-filter mb-2">
        <Button
          className="btn-clear-filter"
          style={{ padding: '5px 32px', backgroundColor: `${COLOR.MAIN_COLOR}` }}
          onClick={() => getListService(params.id)}
        >
          Lọc
        </Button>
      </div>
    </div>
  )
}

export default TourFilter
