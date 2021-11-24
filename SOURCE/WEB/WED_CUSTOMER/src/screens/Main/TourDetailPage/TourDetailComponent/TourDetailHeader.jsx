import React, { useState, useEffect } from 'react'
import { Tooltip } from 'antd'
import { useLocation, useParams } from 'react-router-dom'
import swal from 'sweetalert'

import '../TourDetailPage.css'
import { STRING, ROUTER } from '@constants/Constant'
import { handleRating } from '@utils/handleRating.js'
import serviceApi from '@networks/serviceApi'
import { notifySuccess } from '@utils/notify'
import RoomIcon from '@material-ui/icons/Room'
import HowToRegIcon from '@material-ui/icons/HowToReg'
import CodeIcon from '@material-ui/icons/Code'

const TourDetailHeader = (props) => {
  const { tourDetail, userInfo, index, handleLike } = props
  const [listService, setListService] = useState([])
  const [checkLiked, setCheckLiked] = useState(false)
  const location = useLocation()
  const params = useParams()
  const isExist = location.pathname.search(ROUTER.TOUR_DETAIL_PAGE)

  const likeService = async (msg) => {
    try {
      await serviceApi.likeService({ service_id: tourDetail?.id })
      handleLike(params.id)
      notifySuccess(msg)
    } catch (err) {
      swal('Thất bại', `${err.msg}`, 'error')
    }
  }

  const listServiceLiked = async () => {
    try {
      const res = await serviceApi.listServiceLiked()
      setListService(res.data)
      checkIsExistInListServiceLiked(res.data)
    } catch (err) {
      swal('Thất bại', `${err.msg}`, 'error')
    }
  }

  // useEffect(() => {
  //   listServiceLiked()
  // }, [])

  const checkIsExistInListServiceLiked = (list) => {
    for (var value of list) {
      if (value.id == tourDetail?.id) {
        setCheckLiked(true)
        return true
      }
    }
    setCheckLiked(false)
    return false
  }

  return (
    <>
      <div>
        {!isExist ? (
          <span className="title-tour">{tourDetail?.name}</span>
        ) : (
          <span className="title-tour">{tourDetail?.title}</span>
        )}
        {!isExist && Object.keys(userInfo).length !== 0 && (
          <>
            {tourDetail?.is_liked == 0 ? (
              <Tooltip title="Thêm vào danh sách yêu thích" placement="bottom" style={{ color: 'black' }}>
                <i
                  className="far fa-heart mt-2"
                  style={{ float: 'right', color: 'red', cursor: 'pointer', fontSize: 24 }}
                  onClick={
                    () => likeService('Đã thêm vào danh sách yêu thích')
                    // handleLike(params.id)
                  }
                ></i>
              </Tooltip>
            ) : (
              <Tooltip title="Xóa khỏi danh sách yêu thích" placement="bottom" style={{ color: 'black' }}>
                <i
                  className="fas fa-heart mt-2"
                  style={{ float: 'right', color: 'red', cursor: 'pointer', fontSize: 24 }}
                  onClick={
                    () => likeService('Đã xóa khỏi danh sách yêu thích')
                    // handleLike(params.id)
                  }
                ></i>
              </Tooltip>
            )}
          </>
        )}
        <div></div>
      </div>
      {index === -1 ? (
        <div className="tour-code mt-3" style={{ alignItems: 'center' }}>
          <div>
            <span>
              <HowToRegIcon className="text-white bg-gray mb-1" style={{ borderRadius: '50%', padding: 3 }} />
            </span>
            <span className="star ml-1">{handleRating(tourDetail?.rating)}</span>
          </div>
          <div>
            <span>
              <RoomIcon className="text-white bg-gray mb-1" style={{ borderRadius: '50%', padding: 3 }} />
            </span>
            <strong className="ml-1">{tourDetail?.address || ''}</strong>
          </div>

          <div>
            <span>
              <CodeIcon className="text-white bg-gray mb-1" style={{ borderRadius: '50%', padding: 3 }} />
            </span>
            <strong className="ml-1">{tourDetail?.code}</strong>
          </div>
        </div>
      ) : (
        ''
      )}
    </>
  )
}

export default TourDetailHeader
