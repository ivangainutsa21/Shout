import {
    GET_FULLNAME,
    RECORDING_STATUS,
    REGISTER_PLAYERIDS,
    SAVE_TITLE_RECORD,
    GET_GROUP,
    SAVE_NF,
    ISLOGIN,
} from '../actions'

const initialState = {
    fullName: '',
    recording: 'Write your comment!',
    playerIds: '',
    titleRecordPath: '',
    group: [],
    nf_payload: undefined,
    isLoggedIn: false,
}

export const getUserInfo = (state = initialState, action) => {
    switch (action.type){
        case GET_FULLNAME:
            return {...state, fullName: action.fullName}
        case REGISTER_PLAYERIDS:
            return {...state, playerIds: action.playerIds}
        case GET_GROUP:
            return {...state, group: action.group}
        default:
            return state;
    }
}

export const getAppInfo = (state = initialState, action) => {
    switch (action.type){
        case RECORDING_STATUS:
            if(action.status == false)
                return {...state, recording: 'Write your comment!'}
            else
                return {...state, recording: 'Recording...'}
        case SAVE_TITLE_RECORD:
            return {...state, titleRecordPath: action.path}
        case SAVE_NF:
            return {...state, nf_payload: action.nf_payload}
        case ISLOGIN:
            return {...state, isLoggedIn: action.loggedIn}
        default:
            return state;
    }
}