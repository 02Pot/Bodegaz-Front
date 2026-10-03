import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
    name: 'currentUser',
    initialState: { currentUser: null, token: null },
    reducers: {
        login: (state, action) => {
        state.currentUser = action.payload.currentUser;
        state.token = action.payload.token;
        },
        logout: (state) => {
        state.currentUser = null;
        state.token = null;
        },
    },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;