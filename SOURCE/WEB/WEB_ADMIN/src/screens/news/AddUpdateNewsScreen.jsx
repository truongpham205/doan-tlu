import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { FormControl, Button } from 'react-bootstrap'
import { FormGroup, Input, Label, FormFeedback, CustomInput } from 'reactstrap'
import { Upload, Modal, message } from 'antd'
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'
import { ROUTER, STRING, NEWS_STATUS } from 'constants/Constant'
import InputSelect from 'components/InputSelect'
import 'styles/AddUpdateNews.css'
import ScreenWrapper from 'components/ScreenWrapper'
import HeaderPage from 'components/HeaderPage'
import Editor from 'components/Editor'
import * as NewsApi from 'network/NewsApi'
import { notifySuccess, notifyFail } from 'utils/notify'
import { useHistory } from 'react-router-dom'
import UploadMultiImages from 'components/UploadMultiImages'
import Resizer from 'react-image-file-resizer'
import { createFormData } from 'utils/createFormData'
import './style.css'
function AddUpdateNewsScreen(props) {
  const [news, setNews] = useState({
    title: '',
    description: '',
    content: '',
    display_index: '',
    // isBanner: false,
    is_active: '',
    df_news_type_id: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [editNews, setEditNews] = useState(false)
  const [newsId, setNewsId] = useState('')
  const [isLoadingPicture, setIsLoadingPicture] = useState(false)
  const [imgFile, setImgFile] = useState([])
  const [fileList, setFileList] = useState([])
  const [listNewsType, setListNewsType] = useState([])
  const history = useHistory()
  useEffect(() => {
    getListNewsType()

    if (props.location?.state?.isUpdate) {
      getNewsDetail()
    } else {
      setIsLoading(false)
    }
  }, [])

  const getNewsDetail = async () => {
    const payload = { id: props.match.params.id }
    try {
      const newsDetail = await NewsApi.getNewsDetail(payload)
      setNews({
        title: newsDetail.data.title,
        description: newsDetail.data.description,
        content: newsDetail.data.content,
        display_index: newsDetail.data.display_index,
        // isBanner: false,
        is_active: newsDetail.data?.is_active,
        df_news_type_id: newsDetail.data?.df_news_type?.id,
      })
      if (newsDetail?.data?.image) {
        setFileList([
          {
            url: newsDetail?.data?.image,
            uid: newsDetail?.data?.id,
            status: 'done',
          },
        ])
      }
      setNewsId(payload.id)
      setEditNews(true)
      setIsLoading(false)
    } catch (error) {
      console.log(error)
    }
  }

  const getListNewsType = async () => {
    try {
      const listNewsTypeApi = await NewsApi.getListNewsType()
      setListNewsType(listNewsTypeApi.data)
    } catch (error) {
      console.log(error)
    }
  }

  const FieldGroup = () => {
    const { isBanner, ...other } = news

    const newsType = [
      { typeId: 1, typeName: STRING.news },
      { typeId: 2, typeName: STRING.discount },
      { typeId: 3, typeName: STRING.insurance },
      { typeId: 4, typeName: STRING.loanCapital },
      { typeId: 5, typeName: STRING.home },
      { typeId: 6, typeName: STRING.question },
      { typeId: 7, typeName: STRING.policy },
      { typeId: 8, typeName: STRING.productPurchaseGuide },
      { typeId: 9, typeName: STRING.productDeliveryAndInstallation },
      { typeId: 10, typeName: STRING.warrantyPolicyAndProductReturn },
      { typeId: 11, typeName: STRING.productSecurityPolicy },
      { typeId: 12, typeName: STRING.newCarBuyingGuide },
      { typeId: 13, typeName: STRING.newVehicleDeliveryAndInstallation },
      { typeId: 14, typeName: STRING.warrantyPolicyAndNewCarReturn },
      { typeId: 15, typeName: STRING.newCarSecurityPolicy },
    ]

    return (
      <>
        <div className="col-12 col-md-6 row pl-2 d-flex align-items-center mb-3 input__news">
          <div className="col-12 col-md-4 label--input__news">
            <span>{STRING.typeNews}</span>
          </div>
          <div className="col-12 col-md-7 input__news">
            <FormControl
              as="select"
              aria-describedby="basic-addon1"
              style={{ margin: 0 }}
              value={news.df_news_type_id}
              onChange={(e) => setNews({ ...news, df_news_type_id: e.target.value })}
            >
              <option value="" defaultValue>
                {STRING.typeNews}
              </option>
              {listNewsType?.map((item, index) => (
                <option value={item.id} key={index}>
                  {item.name}
                </option>
              ))}
            </FormControl>
          </div>
        </div>

        <div className="col-12 col-md-6 row pr-0 d-flex align-items-center mb-3 input__news">
          <div className="col-12 col-md-4 label--input__news">
            <span>{STRING.status}</span>
          </div>
          <div className="col-12 col-md-6 pr-0 ">
            <FormControl
              as="select"
              aria-describedby="basic-addon1"
              style={{ margin: 0 }}
              value={news.is_active}
              onChange={(e) => setNews({ ...news, is_active: e.target.value })}
            >
              <option value="" defaultValue>
                {STRING.status}
              </option>
              <option value={NEWS_STATUS.POSTING}>{STRING.postNews}</option>
              <option value={NEWS_STATUS.DRAFT}>{STRING.savedDraft}</option>
            </FormControl>
          </div>
        </div>

        {/* <div className="col-12 col-md-6 row d-flex align-items-center mb-3">
          <div className="col-3" style={{ textAlign: 'center' }}>
            <span>{STRING.banner}</span>
          </div>
          <div className="col-9">
            <input type="checkbox" checked={news.isBanner} onChange={() => setNews({ ...news, isBanner: !isBanner })} />
            <CustomInput
              type="switch"
              id="exampleCustomSwitch"
              name="customSwitch"
              label="Turn on this custom switch"
              checked={news.isBanner}
              onChange={() => setNews({ ...news, isBanner: !isBanner })}
            />
          </div>
        </div> */}
        {/* <div className="col-12 col-md-5 row"></div> */}
      </>
    )
  }

  const renderHeader = () => {
    return <HeaderPage context={props} titleHeader={editNews ? STRING.editNews : STRING.addNews}></HeaderPage>
  }

  const ButtonGroup = () => {
    return (
      <div className="col-12 text-center">
        <Button variant="danger" onClick={() => history.goBack()}>
          {STRING.exit}
        </Button>
        <Button variant="success" onClick={() => createNews()}>
          {STRING.save}
        </Button>
      </div>
    )
  }

  const handleChangeInput = (fieldName, value) => {
    setNews({
      ...news,
      [fieldName]: value || '',
    })
  }

  const handleMultiImg = async () => {
    let result = {}
    await Promise.all(
      imgFile?.map(async (image, index) => {
        if (image.hasOwnProperty('originFileObj')) result['image'] = await resizeFile(image.originFileObj)
      })
    )
    return result
  }

  const resizeFile = async (file) => {
    if (file?.size >= 1272864) {
      return new Promise((resolve) => {
        Resizer.imageFileResizer(
          file,
          1000,
          1000,
          //get type image
          file.type.split('/')[1].toUpperCase(),
          70,
          0,
          (uri) => {
            resolve(uri)
          },
          'blob',
          300,
          300
        )
      })
    }

    return new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        1000,
        1000,
        //get type image
        file.type.split('/')[1].toUpperCase(),
        100,
        0,
        (uri) => {
          resolve(uri)
        },
        'blob',
        300,
        300
      )
    })
  }

  const createNews = async () => {
    let image = await handleMultiImg()
    if (!editNews && !Object.keys(image).length) {
      notifyFail('Vui lòng cung cấp hình ảnh')
      return
    }

    if (editNews && !Object.keys(image).length && !fileList.length) {
      notifyFail('Vui lòng cung cấp hình ảnh')
      return
    }

    if (!news.title || !news.description || !news.content || !news.df_news_type_id || news.is_active === '') {
      if (!news.title) {
        notifyFail('Vui lòng nhập tiêu đề!')
        return
      }
      if (!news.description) {
        notifyFail('Vui lòng nhập mô tả!')
        return
      }
      if (!news.display_index) {
        notifyFail('Vui lòng điền thứ tự hiển thị!')
        return
      }
      if (!news.content) {
        notifyFail('Vui lòng nhập nội dung!')
        return
      }
      if (!news.df_news_type_id) {
        notifyFail('Vui lòng chọn loại tin tức!')
        return
      }
      if (news.is_active === '') {
        notifyFail('Vui lòng chọn trạng thái!')
        return
      }
    }
    const data = {
      title: news.title || '',
      display_index: news.display_index || '',
      content: news.content || '',
      description: news.description || '',
      is_active: parseInt(news.is_active),
      df_news_type_id: news.df_news_type_id || '',
      ...image,
    }

    setIsLoading(true)

    try {
      if (editNews) {
        data.id = newsId
        const payload = createFormData(data)
        await NewsApi.updateNews(payload)
        notifySuccess(STRING.editSuccess)
      } else {
        const payload = createFormData(data)
        await NewsApi.createNews(payload)
        notifySuccess(STRING.addSuccess)
      }
      history.goBack()
    } catch (error) {
      setIsLoading(false)
      console.log(error)
    }
  }

  const onChangeUploadFile = (info) => {
    if (editNews && !info.length) {
      setFileList([])
    }
    if (info[0]?.status === 'error') {
      delete info[0].error
      info[0].status = 'done'
    }
    setImgFile(info)
  }

  return (
    <ScreenWrapper
      isLoading={isLoading}
      detail={true}
      context={props}
      renderHeader={renderHeader}
      titleHeader={STRING.addNews}
    >
      <div className="row mb-2 p-2">
        <div className="box--shadow col-12 row mx-auto p-3">
          <FieldGroup />
          <div className="col-12 mb-3 pl-1 row d-flex align-items-center input__news">
            <div className="col-md-2 label--input__news">
              <span>{STRING.title}</span>
            </div>
            <div className="col-md-9 input--text__news">
              <Input
                type="text"
                autoComplete="off"
                style={{ margin: 0 }}
                placeholder={STRING.title}
                value={news.title || ''}
                onChange={(e) => handleChangeInput('title', e.target.value)}
              />
            </div>
          </div>
          <div className="col-12 pl-1 row mb-3 input__news">
            <div className="col-12 col-md-2 label--input__news ">
              <span>{STRING.note}</span>
            </div>
            <div className="col-12 col-md-9 input--text__news">
              <Input
                type="textarea"
                rows={5}
                placeholder={STRING.note}
                value={news.description || ''}
                onChange={(e) => handleChangeInput('description', e.target.value)}
              />
            </div>
          </div>
          <div className="col-12 pl-1 row mb-4 input__news">
            <div className="col-12 col-md-2 label--input__news ">
              <span>{STRING.displayIndex}</span>
            </div>
            <div className="col-12 col-md-9 input--text__news">
              <Input
                type="number"
                autoComplete="off"
                style={{ margin: 0 }}
                placeholder={STRING.displayIndex}
                value={news.display_index || ''}
                onChange={(e) => handleChangeInput('display_index', e.target.value)}
              />
            </div>
          </div>
          <div className="col-12 pl-1 row mb-3 input__news">
            <div className="col-12 col-md-2 label--input__news ">
              <span>{STRING.avatar}</span>
            </div>
            <div className="col-12 col-md-9 input--text__news">
              <UploadMultiImages
                numberOfElement={1}
                text={STRING.avatar}
                changeMultiImages={onChangeUploadFile}
                fileListImg={fileList}
                // fieldName={'avatar'}
                edit={editNews}
                // detail={productDetail}
              />
            </div>
          </div>
        </div>
        <div className="col-12 mx-auto m-3 mt-2 pt-4 pb-5 px-3 table--shadow" style={{ overflow: 'auto' }}>
          <Editor handleChangeContentHtml={handleChangeInput} contentHtml={news.content} contentHtmlName="content" />
        </div>
        <ButtonGroup />
      </div>
    </ScreenWrapper>
  )
}

AddUpdateNewsScreen.propTypes = {}

export default AddUpdateNewsScreen
