import axios from 'axios';

const baseURL = 'https://ergast.com/api/f1';

export const Request = async <T>(url: string, params?: string): Promise<T> => {
    const _url = `${url}.json${params != null ? `?${params}` : ''}`;
    const data = await axios.get(_url, {
        baseURL,
        responseType: 'json',
    });

    if (data.status != 200) throw new Error('Request failed');

    // console.log(`made req to ${baseURL}/${_url}`);

    return data.data as T;
};
