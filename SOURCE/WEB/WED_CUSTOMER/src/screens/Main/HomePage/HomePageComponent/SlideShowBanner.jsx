import { ROUTER } from '@constants/Constant'
import DateFnsUtils from '@date-io/date-fns'
import { Button, Container, TextField } from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'
import React from 'react'
import { useHistory } from 'react-router-dom'
import 'swiper/components/navigation/navigation.min.css'
import 'swiper/components/pagination/pagination.min.css'
import SwiperCore, { Autoplay, Navigation, Pagination } from 'swiper/core'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/swiper.min.css'
import './styles.css'

SwiperCore.use([Autoplay, Pagination, Navigation])

const SlideShowBanner = (props) => {
  const { banners } = props
  const [selectedDate, setSelectedDate] = React.useState()
  const [name, setName] = React.useState('')

  const handleDateChange = (date) => {
    setSelectedDate(date)
  }
  let history = useHistory()

  const handleChangeName = (e) => {
    setName(e.target.value)
  }

  const handleGotoResultSearchPage = () => {
    if (name) {
      localStorage.setItem('name', name)
      history.push(ROUTER.RESULT_SEARCH)
    }
  }

  return (
    <div className="banner-container" style={{ position: 'relative' }}>
      <Container maxWidth="lg" className="box-search_fluid">
        <div className="banner_box-search row m-0">
          <div className="col-md-3 item-search-in-box" style={{ borderRight: '1px solid gray' }}>
            <strong className="m-0">Địa điểm du lịch</strong>
            <TextField
              placeholder="Bạn muốn đi đâu"
              style={{ width: '100%' }}
              onChange={handleChangeName}
              value={name}
            />
          </div>
          <div className="col-md-3 item-search-in-box" style={{ borderRight: '1px solid gray' }}>
            <strong className="m-0">Ngày</strong>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardDatePicker
                id="date-picker-dialog"
                format="dd/MM/yyyy"
                value={selectedDate}
                onChange={handleDateChange}
                placeholder="Chọn thời gian"
                KeyboardButtonProps={{
                  'aria-label': 'change date',
                }}
                style={{ width: '100%' }}
              />
            </MuiPickersUtilsProvider>
          </div>
          <div className="col-md-3">
            <strong className="m-0">Số khách</strong>
            <TextField placeholder="Chọn số người" type="number" style={{ width: '100%' }} />
          </div>
          <div className="col-md-3 text-right btn_search_inbox_home">
            <Button
              variant="contained"
              style={{ backgroundColor: '#0ABE35', color: '#fff' }}
              startIcon={<SearchIcon />}
              onClick={() => handleGotoResultSearchPage()}
            >
              Tìm kiếm
            </Button>
          </div>
        </div>
      </Container>
      <Swiper
        spaceBetween={0}
        centeredSlides={true}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        loop={true}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        className="mySwiper"
        style={{ marginTop: 0 }}
      >
        {banners?.news?.length > 0 &&
          banners?.news?.map((value, key) => (
            <SwiperSlide>
              <img
                className="d-block w-100 img-banner"
                src={value?.image}
                style={{ borderRadius: 0 }}
                onClick={() => history.push(ROUTER.NEW_DETAIL + `/${value.id}`)}
              />
            </SwiperSlide>
          ))}
      </Swiper>
    </div>
  )
}

export default SlideShowBanner
