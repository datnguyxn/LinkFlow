import axios from "axios";

import { config } from "@/config";

import { requestInterceptor } from "./interceptors/request.interceptor";

export const api = axios.create({
  baseURL: config.NEXT_PUBLIC_API_URL,

  timeout: 10000,

  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});


api.interceptors.request.use(requestInterceptor);