import {
    GET_FULLNAME,
    RECORDING_STATUS,
    REGISTER_PLAYERIDS,
} from '../actions'

const initialState = {
    fullName: '',
    recording: 'Write your comment!',
    playerIds: '',
}

export const getUserInfo = (state = initialState, action) => {
    switch (action.type){
        case GET_FULLNAME:
            return {...state, fullName: action.fullName}
        case REGISTER_PLAYERIDS:
            return {...state, playerIds: action.playerIds}
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
        default:
            return state;
    }
}