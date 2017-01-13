import {browserHistory} from 'react-router'

const SESSION_CREATE = 'session/CREATE';
const SESSION_DESTROY = 'session/DESTROY';

const initialState = {
    account: null,
    profile: {}
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case SESSION_CREATE:
            localStorage.setItem('chronoBankAccount', action.payload);
            // TODO: get user from Contracts, then add profile type.
            return {
                account: action.payload,
                profile: {
                    type: 'loc'
                }
            };
        case SESSION_DESTROY:
            localStorage.removeItem('chronoBankAccount');
            return initialState;
        default:
            return state;
    }
};

const createSession = (payload) => ({type: SESSION_CREATE, payload});
const destroySession = () => ({type: SESSION_DESTROY});

const login = (account) => (dispatch) => {
    dispatch(createSession(account));
    browserHistory.push('/');
};

const logout = () => (dispatch) => {
    Promise.resolve(dispatch(destroySession()))
        .then(() => browserHistory.push('/login'));
};

export {
    login,
    logout
}

export default reducer;