export const GET_FULLNAME = 'GET_FULLNAME'
export const RECORDING_STATUS = 'RECORDING_STATUS'
export const REGISTER_PLAYERIDS = 'REGISTER_PLAYERIDS'
export const SAVE_TITLE_RECORD = 'SAVE_TITLE_RECORD'
export const GET_GROUP = 'GET_GROUP'
export const SAVE_NF = 'SAVE_NF'

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

export function getGroup(group){
    return { type: GET_GROUP, group};
}

export function save_nf(nf_payload){
    return { type: SAVE_NF, nf_payload};
}
