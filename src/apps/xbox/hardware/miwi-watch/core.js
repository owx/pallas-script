import { request, accessToken, defaultImei } from './request.js';


export async function sendCommand(commandCode, reqId) {
    let url = "/api/command/sendcommand";

    let body = {
        AccessToken: accessToken,
        Imei: defaultImei,
        CommandCode: commandCode,
        // CommandValue: commandValue,
        ReqId: reqId,
    }

    return request.post(url, body)
}


/**
 * 
 * @param {*} beginTime 
 * @param {*} endTime 
 * @param {*} imei 
 * @returns 
 */
export async function getTrackInfo(beginTime, endTime) {
    let url = "/api/track/get_track_info";

    let body = {
        AccessToken: accessToken,
        Imei: defaultImei,
        BeginTime: beginTime,
        EndTime: endTime,
        MapType: "Baidu",
    }

    return request.post(url, body)
}


export async function getLocalInfo() {
    let url = "/api/location/get_location_info";

    let body = {
        AccessToken: accessToken,
        Imei: defaultImei,
        MapType: "Baidu",
    }

    return request.post(url, body)
}


export async function commandlist() {
    let url = "/api/command/commandlist";

    let body = {
        AccessToken: accessToken,
        Imei: defaultImei,
    }

    return request.post(url, body)
}


export async function getpicture(lastDate, dayPerPage=30) {
    let url = "/api/files/getpicture";

    let body = {
        AccessToken: accessToken,
        Imei: defaultImei,
        LastDate: lastDate,
        DayPerPage: dayPerPage,
    }

    return request.post(url, body)
}
