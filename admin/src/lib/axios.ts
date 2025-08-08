import axios from "axios";
import { config } from "./config";

export const _axios = axios.create({
  baseURL: config.baseUrl,
});
