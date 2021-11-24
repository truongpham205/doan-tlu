import { Upload, Modal, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import React from 'react'

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}

// function beforeUpload(file) {
//   const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
//   if (!isJpgOrPng) {
//     message.error('You can only upload JPG/PNG file!')
//   }
//   const isLt2M = file.size / 1024 / 1024 < 2
//   if (!isLt2M) {
//     message.error('Image must smaller than 2MB!')
//   }
//   return isJpgOrPng && isLt2M
// }

class UploadVideo extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      previewVisible: false,
      previewVideo: '',
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
      ...this.state,
      previewVideo: file.url || file.preview,
      previewVisible: true,
      previewTitle: file.name || file.url.substring(file.url.lastIndexOf('/') + 1),
    })
  }

  handleChange = ({ fileList }) => this.setState({ fileList }, () => this.props.changeVideo(fileList))

  render() {
    const { previewVisible, previewVideo, fileList, previewTitle } = this.state
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
          //   beforeUpload={beforeUpload}
        >
          {fileList?.length >= numberOfElement ? null : uploadButton}
        </Upload>

        <Modal visible={previewVisible} title={previewTitle} footer={null} onCancel={this.handleCancel}>
          <video
            controls
            src={previewVideo}
            className="uploaded-pic img-thumbnail"
            style={{ width: '100%' }}
          ></video>
        </Modal>
      </>
    )
  }
}

export default UploadVideo
