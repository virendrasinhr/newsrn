import { combineReducers } from 'redux';
import bookmarks from './Slice/bookmarkSlice';


const rootReducer = combineReducers({
  bookmarks : bookmarks.reducer,
});

export default rootReducer;
