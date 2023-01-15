import { configureStore } from '@reduxjs/toolkit'
import rootReducer from './appReducer';

export default configureStore({
          reducer: rootReducer,
})