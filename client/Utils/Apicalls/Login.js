import { LOGIN_API } from "../constants";

export const login = async (data) => {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    
    const raw = JSON.stringify({
        ...data,
    });
    
    const requestOptions= {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
    };
    
    const response = await fetch(`${LOGIN_API}`, requestOptions);
    const resposeData = await response.json();
    return resposeData
};