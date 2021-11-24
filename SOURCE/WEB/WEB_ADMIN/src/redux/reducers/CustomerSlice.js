import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
// import * as Api from '../../constants/Api'

export const getUsers = createAsyncThunk('customer/users', async () => {
  // const users = await Api.getListUser({})
  // console.log({ users })
  // return users
})

export const getCustomerDetail = createAsyncThunk('customer/users', async (payload) => {
  // const user = await Api.getUserDetail(payload)
  // console.log({ user })
  // return user
})

const customerSlice = createSlice({
  name: 'customer',
  reducers: {},
  initialState: {
    isError: null,
    isLoading: true,
    data: null,
  },
})

export const actions = customerSlice.actions
export default customerSlice.reducer
