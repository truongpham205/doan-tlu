/*
 * Simple editor component that takes placeholder text as a prop
 */
import React from 'react'
import PropTypes from 'prop-types'
import ReactQuill, { Quill } from 'react-quill'
import './Editor.css'
import * as ProductApi from 'network/ProductApi'
import { notifyFail } from 'utils/notify'
// import QuillEmoji from 'quill-emoji'
// import 'quill-emoji/dist/quill-emoji.css'
class Editor extends React.Component {
  constructor(props) {
    super(props)
    this.state = { theme: 'snow', cotent: '' }
    this.handleChange = this.handleChange.bind(this)
    // this.getLength = this.getLength.bind(this)
    // this.apiPostNewsImage = this.apiPostNewsImage.bind(this)
    this.reactQuillRef = React.createRef()
    this.quillRef = null
  }

  componentDidMount() {
    this.attachQuillRefs()
  }

  componentDidUpdate() {
    this.attachQuillRefs()
  }

  attachQuillRefs = () => {
    if (typeof this.reactQuillRef.getEditor !== 'function') return
    this.quillRef = this.reactQuillRef.getEditor()
  }

  handleChange(html) {
    // console.log(this.props.contentHtml)
    var quill = this.quillRef
    //number of character is limit only include content not any html

    var limit = 2000

    // console.log(quill.getText(), html.length, 'content')

    // var numberOfCharacterHtml = html.length - quill.getText().length
    if (quill) {
      quill.on('text-change', function (delta, old, source) {
        if (quill.getLength() > limit) {
          quill.deleteText(limit, quill.getLength())
        }
      })
    }

    // console.log(quill.deleteText(10, 5))

    // console.log(html, 'length')

    this.props.handleChangeContentHtml(this.props.contentHtmlName, html)
  }

  // getLength(number) {
  //   console.log(number, 'length')
  // }

  apiPostNewsImage = async (formData) => {
    try {
      const imageUrl = await ProductApi.uploadImg(formData)
      return imageUrl.data[0]
    } catch (error) {
      console.log(error)
    }
    // API post, returns image location as string e.g. 'http://www.example.com/images/foo.png'
  }

  imageHandler() {
    const input = document.createElement('input')

    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.click()

    input.onchange = async () => {
      const file = input.files[0]
      // console.log(file, 'file')
      const formData = new FormData()

      formData.append('image', file)

      // Save current cursor state
      const range = this.quill.getSelection(true)

      // Insert temporary loading placeholder image
      this.quill.insertEmbed(range.index, 'image', `${window.location.origin}/images/loaders/placeholder.gif`)

      // Move cursor to right side of image (easier to continue typing)
      this.quill.setSelection(range.index + 1)
      // console.log(formData, 'formdatra')
      try {
        const res = await ProductApi.uploadImg(formData) // API post, returns image location as string e.g. 'http://www.example.com/images/foo.png'

        // Remove placeholder image
        this.quill.deleteText(range.index, 1)

        // Insert uploaded image
        // this.quill.insertEmbed(range.index, 'image', res.body.image);
        this.quill.insertEmbed(range.index, 'image', res.data[0])
      } catch (error) {
        this.quill.deleteText(range.index, 1)

        // Insert uploaded image
        // this.quill.insertEmbed(range.index, 'image', res.body.image);
        this.quill.insertEmbed(range.index, 'image', '')
      }
    }
  }

  // handleThemeChange(newTheme) {
  //   if (newTheme === 'core') newTheme = null
  //   this.setState({ theme: newTheme })
  // }

  render() {
    return (
      <>
        <ReactQuill
          theme={this.state.theme}
          onChange={this.handleChange}
          // getlength={this.getLength}
          ref={(el) => {
            this.reactQuillRef = el
          }}
          value={this.props.contentHtml}
          // modules={Editor.modules}
          formats={Editor.formats}
          // getLength={this.getLength}
          //   bounds={'.app'}
          style={{ width: '100%', padding: '12px 8px', height: this.props.height || 500 }}
          placeholder={this.props.placeholder}
          modules={{
            toolbar: {
              container: [
                // [{ header: '1' }, { header: '2' }, { header: [3, 4, 5, 6] }, { font: [] }],
                [{ header: [1, 2, 3, 4, 5, 6] }, { font: [] }],
                [{ size: [] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ align: [] }],
                [{ indent: '-1' }, { indent: '+1' }],
                [{ list: 'ordered' }, { list: 'bullet' }],
                // ['link', 'video'],
                ['link', 'image', 'video'],
                ['clean'],
                ['code-block'],
              ],
              handlers: {
                image: this.imageHandler,
              },
            },
            // maxlength: { value: 2500 },
            // history: { delay: 100, userOnly: true },
          }}
        />
      </>
    )
  }
}

/*
 * Quill modules to attach to editor
 * See https://quilljs.com/docs/modules/ for complete options
 */
// Editor.modules = {
//   // toolbar: [
//   //   [{ header: '1' }, { header: '2' }, { font: [] }],
//   //   [{ size: [] }],
//   //   ['bold', 'italic', 'underline', 'strike', 'blockquote'],
//   //   [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
//   //   ['link', 'video', 'image'],
//   //   ['clean'],
//   // ],
//   toolbar: [
//     ['bold', 'italic', 'underline', 'strike'], // toggled buttons
//     ['blockquote', 'code-block'],
//     [{ font: [] }],

//     // [{ header: 1 }, { header: 2 }], // custom button values
//     [{ header: [1, 2, 3, 4, 5, 6, false] }],

//     [{ align: [] }],
//     [{ list: 'ordered' }, { list: 'bullet' }],
//     [{ indent: '-1' }, { indent: '+1' }],
//     [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
//     ['link', 'video', 'image'],
//     // outdent/indent
//     // [{ direction: 'rtl' }], // text direction

//     [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown

//     [{ color: [] }, { background: [] }], // dropdown with defaults from theme

//     // ['clean'],
//   ],
//   clipboard: {
//     // toggle to add extra line breaks when pasting HTML:
//     matchVisual: false,
//   },
//   handlers: {
//     image: this.imageHandler,
//   },
// }
/*
 * Quill editor formats
 * See https://quilljs.com/docs/formats/
 */
Editor.formats = [
  'header',
  'font',
  'size',
  'bold',
  'formats',
  'italic',
  'underline',
  'strike',
  'color',
  'background',
  'blockquote',
  'list',
  'bullet',
  'indent',
  'align',
  'link',
  'image',
  'video',
]

/*
 * PropType validation
 */
Editor.propTypes = {
  placeholder: PropTypes.string,
  contentHtml: PropTypes.string,
  contentHtmlName: PropTypes.string,
  handleChangeContentHtml: PropTypes.func,
}

Editor.defaultProps = {
  placeholder: '',
  contentHtml: '',
  contentHtmlName: '',
  handleChangeContentHtml: () => {},
}

export default Editor
