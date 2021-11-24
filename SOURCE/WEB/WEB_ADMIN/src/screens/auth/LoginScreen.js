import React from 'react'
import { Redirect } from 'react-router-dom'
import { STRING, ROUTER } from 'constants/Constant'
import { requestLogin } from 'constants/Api'
// import { login } from 'redux/actions'
import LoadingAction from 'components/LoadingAction'
import InputField from 'components/InputField'
import 'styles/Login.css'
import Cookie from 'js-cookie'
import { FastField, Form, Formik } from 'formik'
import { Button, FormGroup, Spinner } from 'reactstrap'
import * as Yup from 'yup'

class LoginScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      userName: '',
      password: '',
      loadingAction: false,
    }
    this.login = this.login.bind(this)
  }

  login = async (values) => {
    const { phone, password } = values

    this.setState({
      ...this.state,
      loadingAction: true,
    })

    if (!phone || !password) {
      alert('Vui lòng nhập đầy đủ thông tin!')
      this.setState({
        ...this.state,
        loadingAction: false,
      })
      return
    }

    try {
      const res = await requestLogin(
        {
          phone,
          password,
        },
        () =>
          this.setState({
            loadingAction: false,
          })
      )

      Cookie.set('SESSION_ID', res.data.token, {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month
      })

      Cookie.set('STRINGEE', res.data.stringee_access_token, {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month
      })

      localStorage.setItem('userInfo', JSON.stringify(res?.data))
      localStorage.setItem('roleTabs', JSON.stringify(res?.data))

      this.props.history.push(ROUTER.ORDER_BOOK_ROOM)
    } catch (err) {
      console.log(err)
      this.setState({
        ...this.state,
        loadingAction: false,
      })
    }
  }

  handleTextChange(field, event) {
    this.setState({
      ...this.state,
      [field]: event.target.value,
    })
  }

  render() {
    const { loadingAction } = this.state
    const initialValues = {
      phone: '',
      password: '',
    }

    const validationSchema = Yup.object().shape({
      phone: Yup.string().required(STRING.requiredUsername),
      password: Yup.string().required(STRING.requiredPassword),
    })

    const token = Cookie.get('SESSION_ID')
    if (token) {
      return <Redirect to="/" />
    }
    return (
      <>
        {loadingAction && <LoadingAction />}
        <div className="wrapper--login">
          <div className="loginForm" style={{ backgroundColor: '#fff' }}>
            <div className="loginForm__img mt-0 mb-5 px-3 pt-4">
              <img src={require('../../assets/hcn_Oho.png')} alt="logo" style={{ width: '100%', height: 'auto' }} />
            </div>
            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={this.login}>
              {(formikProps) => {
                const { values, errors, touched, isSubmitting } = formikProps

                return (
                  <Form style={{ width: '75%', textAlign: 'center' }}>
                    <FastField name="phone" component={InputField} placeholder={STRING.phoneNumber} />

                    <FastField name="password" component={InputField} placeholder={STRING.passWord} type="password" />

                    <FormGroup className="text-center mt-5">
                      <Button type="submit" color="warning" id="button">
                        {STRING.login}
                      </Button>
                      <p>
                        <a href="forgot-pass" className="mb-3 " style={{ textDecoration: 'none', color: 'white' }}>
                          {STRING.forgotPass}
                        </a>
                      </p>
                    </FormGroup>
                  </Form>
                )
              }}
            </Formik>
          </div>
        </div>
      </>
    )
  }
}

export default LoginScreen
