import axios from "axios";
import { config } from "./config";

export const _axios = axios.create({
  baseURL: config.BaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});
