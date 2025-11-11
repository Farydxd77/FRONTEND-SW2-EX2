import { createBrowserRouter, Navigate } from "react-router";
import { ShopLayout } from "./shop/layouts/ShopLayout";
import { HomePage } from "./shop/page/home/HomePage";
import { ProductPage } from "./shop/page/product/ProductPage";
import { GenderPage } from "./shop/page/gender/GenderPage";
import { LoginPage } from "./auth/pages/login/LoginPage";
import { RegisterPage } from "./auth/pages/register/RegisterPage";
import { DasboardPage } from "./admin/page/dashboard/DasboardPage";
import { AdminProductsPage } from "./admin/page/products/AdminProductsPage";
import { AdminProductPage } from "./admin/page/product/AdminProductPage";
import { lazy } from "react";
import {  AdminRoute, NotAuthenticatedRoute } from "./components/routes/ProtectedRoutes";
import OrdersPage from "./admin/page/Orders/OrdersPage";


const AuthLayouts = lazy( () => import('./auth/layouts/AuthLayouts'));
const AdminLayout = lazy( () => import('./admin/layouts/AdminLayout'))


export const appRouter = createBrowserRouter([
    // Main Routes
    {
        path: '/',
        element: <ShopLayout/>,
        children: [
            {
                index: true,
                element: <HomePage/>
            },
            {
                path: 'product/:idSlug',
                element: <ProductPage/>
            },
            {
                path: 'gender/:gender',
                element: <GenderPage/>,
            },
        ]
    },

    // Auth Routes 
    {
        path: '/auth',
        element:
        <NotAuthenticatedRoute>
            <AuthLayouts/>
        </NotAuthenticatedRoute>
        ,
        children: [
            {
                index: true,
                element: <Navigate to="/auth/login"/>
            },
            {
                path: 'login',
                element: <LoginPage/>,
            },
            {
                path: 'register',
                element: <RegisterPage/>
            }
        ]
    },
    // Admin Routes
    {
        path: '/admin',
        element:
            <AdminRoute>
                <AdminLayout/> 
            </AdminRoute>
        ,
        children: [
            {
                index: true,
                element: <DasboardPage/>
            },
            {
                path: 'products',
                element: <AdminProductsPage/>
            },
             {
                path: 'ordenes',
                element: <OrdersPage/>
            },
            {
                path: 'products/:id',
                element: <AdminProductPage/>
            },
            
        ]
    },{
        path: '*',
        element: <Navigate to='/    '/>

    }
])