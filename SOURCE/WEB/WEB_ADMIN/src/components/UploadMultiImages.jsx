import { Upload, Modal, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import React, { PropTypes } from 'react'
import reactotron from 'debug/ReactotronConfig'

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}

function beforeUpload(file) {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg'

  if (!isJpgOrPng) {
    message.error('You can only upload JPG/PNG file!')
    return
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  // if (!isLt2M) {
  //   message.error('Image must smaller than 2MB!')
  // }
  return isJpgOrPng && isLt2M
}

class UploadMultiImages extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      previewVisible: false,
      previewImage: '',
      previewTitle: '',
      fileList: this.props.edit || this.props.detail ? this.props.fileListImg : [],
    }
  }

  handleCancel = () => this.setState({ previewVisible: false })

  handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj)
    }

    this.setState({
      previewImage: file.url || file.preview,
      previewVisible: true,
      previewTitle: file.name || file.url.substring(file.url.lastIndexOf('/') + 1),
    })
  }

  handleChange = ({ fileList }) => {
    const { index } = this.props
    if (typeof index === 'number') {
      this.setState({ fileList }, () => this.props.changeMultiImages(fileList, index))
      return
    }
    this.setState({ fileList }, () => this.props.changeMultiImages(fileList, this.props.fieldName))
  }

  render() {
    const { previewVisible, previewImage, fileList, previewTitle } = this.state
    const { numberOfElement, text } = this.props
    const uploadButton = !this.props.detail ? (
      <div>
        <PlusOutlined />
        <div style={{ marginTop: 8 }}>{text}</div>
      </div>
    ) : (
      ''
    )
    return (
      <>
        <Upload
          action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
          listType="picture-card"
          fileList={fileList}
          onPreview={this.handlePreview}
          onChange={this.handleChange}
          beforeUpload={beforeUpload}
        >
          {fileList?.length >= numberOfElement ? null : uploadButton}
        </Upload>

        <Modal visible={previewVisible} title={previewTitle} footer={null} onCancel={this.handleCancel}>
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </>
    )
  }
}

UploadMultiImages.defaultProps = {
  fileListImg: [],
  index: null,
  changeMultiImages: () => {},
  numberOfElement: null,
  text: '',
  detail: false,
  edit: false,
  fieldName: '',
}

export default UploadMultiImages
