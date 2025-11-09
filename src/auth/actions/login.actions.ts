import { tesloApi } from "@/api/tesloApi"
import type { AuthResponse } from "../interface/auth.response";



export const loginAction = async( email: string, password: string ): Promise<AuthResponse> => {

    try {
        

        const { data } = await tesloApi.post<AuthResponse>('/auth/login', {
            email: email,
            password: password
        })
        console.log(data)



        return data;

        
    } catch (error) {
        console.log(error)
         throw error;
    }

}