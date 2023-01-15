import { createSlice } from '@reduxjs/toolkit';

const bookmarks = createSlice({
  name: 'bookmarks',
  initialState: {
    loading: false,
    data: [],
  },
  reducers: {
    toggleBookmark(state, action) {
      let bookmark = state.data;
      if (bookmark.some(bookmark => bookmark?.title == action?.payload?.title)) {
        bookmark = bookmark.filter(bookmark => bookmark?.title !== action?.payload?.title)
      } else {
        state.data = bookmark.push(action?.payload?.bookMark);
      }
      if (bookmark) {
        state.data = bookmark;
      } else {
        state.data = [];
      }
    }
  },
});

export const { toggleBookmark } = bookmarks.actions;

export default bookmarks;