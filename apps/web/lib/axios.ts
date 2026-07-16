import axios from 'axios';

import { config } from '@/config';

import { requestSuccess, requestError } from './interceptors/request.interceptor';

import { responseSuccess, responseError } from './interceptors/response.interceptor';
import i18n from '@/i18n';

export const api = axios.create({
  baseURL: config.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Đăng ký Request Interceptor
api.interceptors.request.use(requestSuccess, requestError);
api.interceptors.request.use((config) => {
  config.headers['Accept-Language'] = i18n.language; // Thêm header Accept-Language với giá trị ngôn ngữ hiện tại
  return config;
});

// Đăng ký Response Interceptor
api.interceptors.response.use(responseSuccess, responseError);
