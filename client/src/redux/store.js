import {configureStore} from '@reduxjs/toolkit'
import authReducer from './authSlice'
import accountReducer from './accountSlice'
import adminReducer from './adminSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        account: accountReducer,
        admin: adminReducer
    }
})

export default store 