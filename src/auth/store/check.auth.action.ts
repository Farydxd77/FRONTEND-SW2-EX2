import { tesloApi } from "@/api/tesloApi";
import type { AuthResponse } from "../interface/auth.response";



export const checkAuthAction = async ():Promise<AuthResponse> => {
    

    const token = localStorage.getItem('token');
    if( !token) throw new Error('No token found');

    try {
        
        const { data } = await tesloApi.get<AuthResponse>('/auth/check-status')

        localStorage.setItem('token', data.token);

        return data;


    } catch (e) {
        console.log(e)
        localStorage.removeItem('token')        
        throw new Error('Token expired not valid ')
    }
}
