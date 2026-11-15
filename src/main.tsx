import { createRoot } from 'react-dom/client';
import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Layout, RequireAuth } from './components/Layout';
import Home from './pages/Home';
import Browse from './pages/Browse';
import AuthPage from './pages/AuthPage';
import PostItem from './pages/PostItem';
import ItemDetail from './pages/ItemDetail';
import MyItems from './pages/MyItems';
import Requests from './pages/Requests';
import NotFound from './pages/NotFound';
import './styles.css';

createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><AuthProvider><ToastProvider>
  <Routes><Route element={<Layout />}>
    <Route index element={<Home />} />
    <Route path="browse" element={<Browse />} />
    <Route path="items/:id" element={<ItemDetail />} />
    <Route path="login" element={<AuthPage mode="login" />} />
    <Route path="register" element={<AuthPage mode="register" />} />
    <Route path="post" element={<RequireAuth><PostItem /></RequireAuth>} />
    <Route path="items/:id/edit" element={<RequireAuth><PostItem /></RequireAuth>} />
    <Route path="my-items" element={<RequireAuth><MyItems /></RequireAuth>} />
    <Route path="requests" element={<RequireAuth><Requests /></RequireAuth>} />
    <Route path="404" element={<NotFound />} />
    <Route path="*" element={<Navigate to="/404" replace />} />
  </Route></Routes>
</ToastProvider></AuthProvider></BrowserRouter></React.StrictMode>);
