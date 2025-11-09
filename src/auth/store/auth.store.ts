import type { User } from '@/interface/user.interface'
import { create } from 'zustand'
import { loginAction } from '../actions/login.actions';
import { checkAuthAction } from './check.auth.action';

type AuthStatus = 'authenticated' | 'not-authenticated' | 'checking'


type AuthState = {

    // Properties
    user: User | null,
    token: string | null,
    authStatus: AuthStatus;


    // Getters
    isAdmin: () => boolean;

    // Actions

    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    checkAuthStatus: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()((set, get ) => ({
//  Implementacion del Store

    user: null,
    token: null,
    authStatus: 'checking',

    // Getters
    isAdmin: () => {
        const roles = get().user?.roles || [];
        return roles.includes('admin');
    },



    // actions

    login: async(email: string, password: string ) => {

        try {

            const data = await loginAction(email,password);
            localStorage.setItem('token', data.token);

            set({ user: data.user, token: data.token, authStatus: 'authenticated' })
            return true;

        } catch (error) {
            console.log(error)
            localStorage.removeItem('token')
            set({ user: null, token: null, authStatus: 'not-authenticated' })
            return false;
        }
        
    },

    logout: () => {
         localStorage.removeItem('token');
         set({ user: null, token: null, authStatus: 'checking' })
    },

    checkAuthStatus: async() => {
        try {
            
            const { user, token } = await checkAuthAction();

            set({
                user: user,
                token: token,
                authStatus: 'authenticated'

            })
        return true;
        } catch (error) {
            console.log(error)
              set({
                user: undefined,
                token: undefined,
                authStatus: 'not-authenticated'

            })
            return false
        }
    }



}))

