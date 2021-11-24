import React, { Component, useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { withRouter, Link } from 'react-router-dom'
import { Row, Col, FormControl } from 'react-bootstrap'
import {
  STRING,
  LABEL_BUTTON_SEARCH,
  LABEL_BUTTON_ADD,
  LABEL_BUTTON_CLEAR_SEARCH,
  NEWS_STATUS,
} from 'constants/Constant'
import DatePickerCustom from 'components/DatePickerCustom'
import ConfirmModal from 'components/ConfirmModal'
import TableData from 'components/TableData'
import HeaderPage from 'components/HeaderPage'
import ButtonType from 'components/ButtonType'
import PaginationComponent from 'components/PaginationComponent'
import 'styles/UserScreen.css'
import * as NewsApi from 'network/NewsApi'
import ScreenWrapper from 'components/ScreenWrapper'
import { toDateString } from 'utils/helper'
import { Table } from 'reactstrap'
import Footer from 'components/Footer'
import { useHistory } from 'react-router-dom'
import { ROUTER } from 'constants/Constant'
import { notifySuccess } from 'utils/notify'
import formatNumber from 'utils/formatNumber'
import Fire from 'utils/FirebaseConfig'
const initialValueSearch = {
  titleName: '',
  status: '',
  newsType: '',
}

const defaultActivePage = 1

function NewsListScreen(props) {
  const [data, setData] = useState([])
  const [listNewsType, setListNewsType] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [confirmModal, setConfirmModal] = useState(false)
  const [activePage, setActivePage] = useState(null)
  const [searchItem, setSearchItem] = useState(initialValueSearch)
  const [checkAll, setCheckAll] = useState(false)
  const [hasEdit, setHasEdit] = useState(false)
  const [isClearSearch, setIsClearSearch] = useState(false)
  const [paging, setPaging] = useState({})
  let history = useHistory()
  const inputRef = useRef(null)

  let showFooter

  if (!isLoading) {
    showFooter = data.findIndex((item) => item.isSelected) >= 0
  }

  useEffect(() => {
    getData()
    getListNewsType()
  }, [])

  useEffect(() => {
    if (activePage !== null) {
      setIsLoading(true)
      getData()
    }
  }, [activePage])

  useEffect(() => {
    if (isClearSearch) {
      setIsLoading(true)
      getData()
    }
  }, [isClearSearch])

  useEffect(() => {
    setIsLoading(true)
    getData()
  }, [searchItem.status, searchItem.newsType])

  useEffect(() => inputRef.current?.focus(), [searchItem.titleName])

  const getData = async () => {
    const { titleName, status, newsType } = searchItem
    const payload = {
      page: activePage,
      search: titleName || '',
      is_active: status ? parseInt(status) : '',
      df_news_type_id: newsType ? parseInt(newsType) : '',
    }
    try {
      // setIsLoading(true)
      const res = await NewsApi.getListNews(payload)
      let listNews = res?.data.map((news) => {
        news.isSelected = false
        return news
      })
      setData(listNews)

      setPaging({
        ...paging,
        ...res?.paging,
      })
      setIsLoading(false)
      if (isClearSearch) {
        setIsClearSearch(false)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getListNewsType = async () => {
    try {
      const listNewsType = await NewsApi.getListNewsType()
      setListNewsType(listNewsType.data)
    } catch (error) {
      console.log(error)
    }
  }

  function onKeyUp(e) {
    if (e.keyCode === 13) {
      let text = e.target.value
      if (!text) {
        return
      }

      text = text.trim()
      if (!text) {
        return
      }
      setIsLoading(true)
      getData()
    }
  }

  const SearchField = () => {
    return (
      <Row className="mx-0 box--shadow pt-4 pb-3 px-3">
        <Col sm>
          <input
            type="text"
            className="form-control"
            autoComplete="off"
            placeholder={STRING.titleName}
            value={searchItem.titleName}
            ref={inputRef}
            onKeyUp={onKeyUp}
            onChange={(e) => {
              setSearchItem({ ...searchItem, titleName: e.target.value })
            }}
          />
        </Col>
        <Col sm>
          <FormControl
            as="select"
            aria-describedby="basic-addon1"
            value={searchItem.status}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            <option value="" defaultValue>
              {STRING.status}
            </option>
            <option value={NEWS_STATUS.POSTING}>{STRING.postNews}</option>
            <option value={NEWS_STATUS.DRAFT}>{STRING.savedDraft}</option>
          </FormControl>
        </Col>
        <Col sm>
          <FormControl
            as="select"
            aria-describedby="basic-addon1"
            value={searchItem.newsType}
            onChange={(e) => handleChange('newsType', e.target.value)}
          >
            <option value="" defaultValue>
              {STRING.typeNews}
            </option>
            {!isLoading &&
              listNewsType.map((item, index) => (
                <option value={item.id} key={index}>
                  {item.name}
                </option>
              ))}
          </FormControl>
        </Col>
        <Col className="col-12">
          <ButtonGroup />
        </Col>
      </Row>
    )
  }

  const ButtonGroup = () => {
    return (
      <Row className="px-0">
        <Col className="button-wrapper pr-1">
          <ButtonType
            typeButton={LABEL_BUTTON_SEARCH}
            isOpen={() => {
              if (activePage === defaultActivePage) {
                setIsLoading(true)
                getData()
                return
              }
              setActivePage(1)
            }}
          />
          <ButtonType
            typeButton={LABEL_BUTTON_CLEAR_SEARCH}
            style={{ marginRight: 0 }}
            isOpen={() => {
              setIsLoading(true)
              setSearchItem(initialValueSearch)
              setIsClearSearch(true)
            }}
          />
        </Col>
      </Row>
    )
  }

  const checkingFooter = (showFooter) => {
    return (
      <React.Fragment>
        <Footer
          delete={() => {
            setConfirmModal(true)
          }}
          checkAll={checkAll}
          handleCheckAll={() => handleCheckAll()}
          showFooter={showFooter}
          hasEdit={hasEdit}
          handleOnEdit={() => {
            onEditItem()
          }}
        ></Footer>
      </React.Fragment>
    )
  }

  const handleCheckAll = () => {
    let isCheckAll = false
    let isEdit = false
    let count = countNumberOfElementIsChecked(data)

    if (count === data.length) {
      isCheckAll = true
    }

    if (count === 1) {
      isEdit = true
    }

    setCheckAll(isCheckAll)
    setHasEdit(isEdit)
  }

  const handleChange = (fieldName, value) => {
    setSearchItem({
      ...searchItem,
      [fieldName]: value || '',
    })
  }

  const countNumberOfElementIsChecked = (arrCheck) => {
    return arrCheck.filter((item) => item.isSelected).length
  }

  const onChangeCheckItem = (value, index) => {
    let newData = [...data]
    newData[index].isSelected = !value.isSelected
    let isCheckAll = false
    let isEdit = false
    let count = countNumberOfElementIsChecked(newData)

    if (count === data.length) {
      isCheckAll = true
    }

    if (count === 1) {
      isEdit = true
    }
    setHasEdit(isEdit)
    setCheckAll(isCheckAll)
    setData(newData)
  }

  const onEditItem = () => {
    let value = data.find((item) => item.isSelected)
    let id = value?.id
    history.push({
      pathname: `${ROUTER.UPDATE_NEWS}/${id}`,
      state: { isUpdate: true },
    })
  }

  const onDeleteItem = async () => {
    let payload = []
    data.forEach((item) => {
      if (item.isSelected) {
        payload.push(item.id)
      }
    })

    try {
      setIsLoading(true)
      await NewsApi.deleteNews({ listID: payload })
      setConfirmModal(false)
      notifySuccess(STRING.deleteSuccess)
      if (payload.length === data.length && activePage !== defaultActivePage) {
        // call useEffect
        setActivePage(1)
        return
      }
      getData()
    } catch (error) {
      setIsLoading(false)
      console.log(error)
    }
  }

  const handleChangePage = (page) => {
    if (page !== activePage) {
      setIsLoading(true)
      setActivePage(page)
    }
  }

  const tableItem = (item, index) => {
    return (
      <tr key={index}>
        <td>{index + 1}</td>
        <td>{item.title || '--'}</td>
        <td>{formatNumber(item.display_index?.toString())}</td>
        <td>{item.df_news_type?.name || '--'}</td>
        <td>{(item.is_active === NEWS_STATUS.POSTING ? STRING.postNews : STRING.savedDraft) || '--'}</td>
        <td>{item?.description || '--'}</td>
        <td>{toDateString(item.created_at)}</td>
        <th>
          <input
            type="checkbox"
            className="cursor"
            checked={item.isSelected}
            onChange={() => onChangeCheckItem(item, index)}
          />
        </th>
      </tr>
    )
  }

  const renderHeader = () => {
    return (
      <HeaderPage
        titleHeader={STRING.news}
        titleButton={STRING.addNews}
        onClickButton={() =>
          props.history.push({
            pathname: `${ROUTER.ADD_NEWS}`,
          })
        }
      ></HeaderPage>
    )
  }

  return (
    <ScreenWrapper
      isLoading={isLoading}
      titleHeader={STRING.news}
      renderHeader={renderHeader}
      renderFooter={() => checkingFooter(showFooter)}
    >
      <SearchField />
      {/* <ButtonGroup /> */}
      <ConfirmModal
        isOpen={confirmModal}
        onHide={() => setConfirmModal(false)}
        title={STRING.delete}
        action={() => onDeleteItem()}
      />
      <div className="pt-4 pb-5 px-3 mt-4 table--shadow">
        <Table bordered striped responsive>
          <thead className="text-center bg-thead">
            <tr>
              <th>{STRING.numericalOrder}</th>
              <th>{STRING.title}</th>
              <th>Thứ tự hiển thị</th>
              <th>Loại tin</th>
              <th>{STRING.status}</th>
              <th>{STRING.note}</th>
              <th>{STRING.createDate}</th>
              <th>
                <input type="checkbox" checked={checkAll} onChange={() => handleCheckAll()} />
              </th>
            </tr>
          </thead>
          <tbody>{data?.map((item, index) => tableItem(item, index))}</tbody>
        </Table>
        <PaginationComponent
          activePage={activePage || 1}
          itemCountPerPage={paging.limit}
          totalItemsCount={paging.count}
          action={handleChangePage}
        />
      </div>
    </ScreenWrapper>
  )
}

NewsListScreen.propTypes = {}

export default withRouter(NewsListScreen)
