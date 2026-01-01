import axios from "axios";

const api = axios.create({
  baseURL: "https://lic-agent-assist-backend.vercel.app"
});

api.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.authorization = token;
  return req;
});

export default api;
