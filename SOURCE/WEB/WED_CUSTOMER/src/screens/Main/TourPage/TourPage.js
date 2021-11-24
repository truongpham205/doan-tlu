import { ROUTER } from '@constants/Constant'
import { Button, Container } from '@material-ui/core'
import serviceApi from '@networks/serviceApi'
import React, { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import swal from 'sweetalert'
import TourFilter from './TourComponent/TourFilter'
import TourList from './TourComponent/TourList'
import './TourPage.css'
import Cookie from 'js-cookie'
import Chat from '../../../Chat'

const TourPage = () => {
  const [listService, setListService] = useState([])
  const [isLoading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [listCateType, setListCateType] = useState([])
  const [listRegionType, setListRegionType] = useState([])
  const params = useParams()
  const location = useLocation()
  const [anchorEl, setAnchorEl] = React.useState(null)
  const index = location.pathname.search(ROUTER.SERVICE_DETAIL)
  const isLogin = Cookie.get('SESSION_ID')

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleChangeSearch = (value) => {
    setSearch(value)
  }

  const handleChangeRegion = (checkedValues) => {
    setListRegionType(checkedValues)
  }

  const handleChangeService = (checkedValues) => {
    setListCateType(checkedValues)
  }

  const handleKeyPress = (e) => {
    if (e.charCode == 13) {
      getListService(params.id)
    }
  }

  const getListService = async (id) => {
    setLoading(true)
    try {
      const params =
        index === -1
          ? {
              search: search,
              is_active: '',
              service_category_id: '',
              regions_id: id,
              province_id: '',
              district_id: '',
              village_id: '',
              isCustomer: 1,
              list_service_category_id: listCateType,
              list_regions_id: '',
            }
          : {
              search: search,
              is_active: '',
              service_category_id: id,
              regions_id: '',
              province_id: '',
              district_id: '',
              village_id: '',
              isCustomer: 1,
              list_service_category_id: '',
              list_regions_id: listRegionType,
            }
      const res = await serviceApi.listService(params)
      setListService(res.data)
      setLoading(false)
    } catch (err) {
      swal('Thất bại', `${err.msg}`, 'error')
      setLoading(false)
    }
  }

  const renderTourFillter = () => {
    return (
      <TourFilter
        getListService={(id, search, list) => getListService(id)}
        handleChangeRegion={(list) => handleChangeRegion(list)}
        handleChangeService={(list) => handleChangeService(list)}
      />
    )
  }

  useEffect(() => {
    window.scrollTo(0, 0)
    getListService(params.id)
  }, [])

  return (
    <>
      <div className="container-fluid mt-3">
        <div style={{ marginBottom: 100 }}>
          <Container maxWidth="lg">
            <div className="row">
              <div className="col-lg-2 col-md-4 tour_list_left">
                <TourFilter
                  getListService={(id, search, list) => getListService(id)}
                  handleChangeRegion={(list) => handleChangeRegion(list)}
                  handleChangeService={(list) => handleChangeService(list)}
                />
              </div>
              <div className="col-lg-10 col-md-8 tour_list_right">
                <TourList
                  listService={listService}
                  isLoading={isLoading}
                  getListService={(id) => getListService(id)}
                  handleChangeSearch={(e) => handleChangeSearch(e)}
                  handleKeyPress={(e) => handleKeyPress(e)}
                  handleClick={handleClick}
                  handleClose={handleClose}
                  renderTourFillter={renderTourFillter}
                  anchorEl={anchorEl}
                />
              </div>
            </div>
          </Container>
        </div>
      </div>
      {isLogin && <Chat />}
    </>
  )
}

export default TourPage
