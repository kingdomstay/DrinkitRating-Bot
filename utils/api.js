import {config} from "dotenv";
config({path: '../.env'})
import {readFileSync, writeFileSync} from 'node:fs';
import axios from "axios";
import qs from "querystring";

let accessToken
let refreshToken = readFileSync('.token').toString()

const updateToken = async () => {
    try {
        const data = {
            client_id: process.env.DODO_CLIENT_ID,
            client_secret: process.env.DODO_CLIENT_SECRET,
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        }
        console.log(data)
        const options = {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            data: qs.stringify(data),
            url: 'https://auth.dodois.io/connect/token',
        };
        console.log(options)
        const response = await axios(options)
        console.log(response)

        accessToken = response.data.access_token
        writeFileSync('.token', response.data.refresh_token)
        refreshToken = response.data.refresh_token

        return {accessToken: response.data.access_token, refreshToken: response.data.refresh_token}

    } catch (err) {
        throw new Error(`[API] Error: ${err}`)
    }
}

// Подгружаем новый токен при запуске
await updateToken(readFileSync('.token').toString())


const api = axios.create({
    baseURL: 'https://api.dodois.io/drinkit/',
    headers: {'Authorization': `Bearer ${accessToken}`}
});

const getFeedbacks = async (comments=true, units) => {
    try {
        units = units.join(',')

        const response =  await api.get(`customer-feedback/recent-feedbacks?includeFeedbacksWithEmptyComment=${!comments}&units=${units}`)
        return response.data.orderFeedbacks
    } catch (err) {
        throw new Error(`[API] Error: ${err}`)
    }
}

export {getFeedbacks, updateToken}
