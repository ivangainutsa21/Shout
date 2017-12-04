export const GET_FULLNAME = 'GET_FULLNAME'
export const RECORDING_STATUS = 'RECORDING_STATUS'
export const REGISTER_PLAYERIDS = 'REGISTER_PLAYERIDS'
export const SAVE_TITLE_RECORD = 'SAVE_TITLE_RECORD'

export function getFullName(fullName){
    return { type: GET_FULLNAME, fullName};
}

export function getRecordingStatus(status){
    return { type: RECORDING_STATUS, status};
}

export function registerPlayerIds(playerIds){
    return { type: REGISTER_PLAYERIDS, playerIds};
}

export function saveTitleRecord(path){
    return { type: SAVE_TITLE_RECORD, path};
}