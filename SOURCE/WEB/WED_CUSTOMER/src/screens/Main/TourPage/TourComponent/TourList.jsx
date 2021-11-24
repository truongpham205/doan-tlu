import Loading from '@components/Loading'
import { Button, TextField } from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'
import { Empty } from 'antd'
import React from 'react'
import { useParams } from 'react-router-dom'
import ReviewCard from '../../../../components/ReviewCard'
import '../TourPage.css'
import ListIcon from '@material-ui/icons/List'
import { withStyles } from '@material-ui/core/styles'
import Menu from '@material-ui/core/Menu'
import FilterListIcon from '@material-ui/icons/FilterList'

const StyledMenu = withStyles({
  paper: {
    border: '1px solid #d3d4d5',
    padding: '10px',
  },
})((props) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'center',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'center',
    }}
    {...props}
  />
))

const TourList = (props) => {
  const {
    listService,
    isLoading,
    getListService,
    handleChangeSearch,
    handleKeyPress,
    handleClick,
    handleClose,
    renderTourFillter,
    anchorEl,
  } = props
  // const [search, setSearch] = useState('')
  const params = useParams()

  return (
    <div>
      {isLoading && <Loading />}
      <div className="d-flex p-0" style={{ alignItems: 'center' }}>
        <TextField
          label="Bạn muốn đi đâu?"
          id="outlined-size-small"
          variant="outlined"
          size="small"
          fullWidth
          InputProps={{
            endAdornment: (
              // <Button
              //   size="small"
              //   style={{ backgroundColor: '#0abe35', color: '#fff', borderRadius: '10px', zIndex: 1 }}
              //   variant="contained"
              //   onClick={() => getListService(params.id)}
              // >
              <SearchIcon onClick={() => getListService(params.id)} />
              // </Button>
            ),
          }}
          onKeyPress={(e) => handleKeyPress(e)}
          onChange={(e) => handleChangeSearch(e.target.value)}
        />
        <div className="tour-list_filter">
          {/* <Button onClick={handleClick}> */}
          <FilterListIcon onClick={handleClick} className="ml-1" />
          <div style={{ fontSize: 10 }}>Lọc</div>
          {/* <ListIcon /> */}
          {/* </Button> */}
          <StyledMenu
            id="customized-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
            style={{ maxHeight: 600 }}
          >
            {renderTourFillter()}
          </StyledMenu>
        </div>
      </div>
      <div className="row tours_box">
        {listService?.length > 0 ? (
          listService?.map((value) => (
            <div className="mt-4 col-xl-4 col-md-6 ">
              <ReviewCard tourDetail={value} displayHeart={true} />
            </div>
          ))
        ) : (
          <Empty description="Không có dữ liệu" style={{ margin: 'auto' }} />
        )}
      </div>
    </div>
  )
}

export default TourList
