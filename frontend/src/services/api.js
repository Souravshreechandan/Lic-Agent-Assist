import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.PROD
    ? "/api"
    : "http://localhost:5000/api"
});

api.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.authorization = token;
  return req;
});

export default api;
