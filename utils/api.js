import 'dotenv/config'
import axios from "axios";

// Тестовый ACCESS TOKEN
const accessToken = process.env.DODO_ACCESS_TOKEN;

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
        throw new Error(`[API] Error: ${error}`)
    }
}

export {getFeedbacks}
