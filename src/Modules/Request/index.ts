import axios from 'axios';

const baseURL = 'https://ergast.com/api/f1';

export const Request = async (url: string): Promise<Object> => {
    const data = await axios.get(url + '.json', {
        baseURL,
        responseType: 'json',
    });

    if (data.status != 200) throw new Error('Request failed');

    return data.data;
};
