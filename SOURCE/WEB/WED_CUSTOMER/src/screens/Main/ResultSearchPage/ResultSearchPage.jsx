import { Container } from '@material-ui/core'
import React, { useEffect, useState } from 'react'
import swal from 'sweetalert'
import Loading from '@components/Loading'
import serviceApi from '@networks/serviceApi'
import ReviewCard from '../../../components/ReviewCard'
import { Empty } from 'antd'

const ResultSearchPage = () => {
  const [listService, setListService] = useState([])
  const [isLoading, setLoading] = useState(false)

  const getListService = async () => {
    const name = localStorage.getItem('name')
    setLoading(true)
    try {
      const params = {
        search: name,
        is_active: '',
        service_category_id: '',
        regions_id: '',
        province_id: '',
        district_id: '',
        village_id: '',
        isCustomer: 1,
        list_service_category_id: '',
        list_regions_id: '',
      }

      const res = await serviceApi.listService(params)
      setListService(res.data)
      setLoading(false)
    } catch (err) {
      swal('Thất bại', `${err.msg}`, 'error')
      setLoading(false)
    }
  }
  useEffect(() => {
    getListService()
    return function cleanup() {
      localStorage.removeItem('name')
    }
  }, [])
  return (
    <>
      {isLoading && <Loading />}
      <Container maxWidth="lg">
        <h3 className='mt-3'>{`Kết quả tìm kiếm cho: ${localStorage.getItem('name')}`}</h3>
        <div className="row tours_box">
          {listService?.length > 0 ? (
            listService?.map((value) => (
              <div className="mt-4 col-xl-3 col-md-4 col-sm-6 ">
                <ReviewCard tourDetail={value} displayHeart={true} />
              </div>
            ))
          ) : (
            <Empty description="Không có dữ liệu" style={{ margin: 'auto' }} />
          )}
        </div>
      </Container>
    </>
  )
}

export default ResultSearchPage
