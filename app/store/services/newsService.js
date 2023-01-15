import axios from 'axios';
import { API_URL, TAG_NEWS_API_KEY } from "@env"
import { endPoints } from '../../endPoint';

export const getNews = async (param) => {
    try {
        const response = await axios.get(API_URL + endPoints.TAG_HEADLINE_ENDPOINT + `country=${param?.country}&apiKey=${TAG_NEWS_API_KEY}`);
        const news = response.data;
        if (news) {
            return news;
        }
    } catch (error) {
        throw error;
    }
}

