import axios, { type AxiosResponse } from "axios";
import { USER_LS_KEY } from "@entities/user/model/constants.ts";

type method = "GET" | "POST" | "PUT" | "DELETE";

type QueryValue = string | number | boolean | null | undefined;
type QueryParam = QueryValue | QueryValue[] | Record<string, unknown>;
type QueryParams = Record<string, QueryParam>;

type SendingData = Record<string, string | number | File | Blob | object>;

class RestAPI {
  method: method = "GET";
  target: string = "";
  baseUrl: string = import.meta.env.VITE_BASE_API_URL;
  data: SendingData | FormData = {};
  token: string = "";

  constructor() {}

  _checkToken = () => {
    const userLS = localStorage.getItem(USER_LS_KEY);
    if (userLS) {
      this.token =
        userLS && JSON.parse(userLS) ? JSON.parse(userLS).token : null;
    } else {
      this.token = "";
    }
  };

  _setTarget = (url: string = "") => {
    if (url) {
      this.target = url;
    }
  };

  _send = (): Promise<AxiosResponse> => {
    this._checkToken();
    if (
      Object.values(this.data).length > 0 &&
      Object.values(this.data).some(
        (value) => value instanceof File || value instanceof Blob,
      )
    ) {
      const data = this.data as SendingData;
      const formData = new FormData();
      for (const key in data) {
        if (
          data[key] instanceof File ||
          data[key] instanceof Blob ||
          typeof data[key] === "string"
        ) {
          formData.append(key, data[key]);
        } else if (typeof data[key] === "number") {
          formData.append(key, data[key].toString());
        } else if (typeof data[key] === "object" && data[key] !== null) {
          formData.append(key, JSON.stringify(data[key]));
        } else {
          formData.append(key, String(data[key]));
        }
      }
      this.data = formData;
    }

    const data: {
      url: string;
      method: string;
      data: object;
      headers?: object;
    } = {
      url: this.baseUrl + this.target,
      method: this.method,
      data: this.data,
    };
    if (this.token) {
      data.headers = {
        Authorization: `Bearer ${this.token}`,
      };
    }
    return axios(data);
  };

  get = (url: string = "", data: QueryParams = {}): Promise<AxiosResponse> => {
    this.method = "GET";
    if (Object.keys(data).length > 0) {
      const queryString = this._buildGetQueryString(data).toString();
      url += `?${queryString}`;
    }
    this._setTarget(url);
    return this._send();
  };

  post<T = SendingData> (url: string = "", data: T): Promise<AxiosResponse> {
    this.method = "POST";
    this._setTarget(url);
    this.data = data as SendingData;
    return this._send();
  };

  _buildGetQueryString(params: QueryParams): string {
    const searchParams = new URLSearchParams();

    const appendParam = (key: string, value: QueryValue): void => {
      if (value !== null && value !== undefined) {
        searchParams.append(key, String(value));
      }
    };

    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => appendParam(key, item));
      } else if (typeof value === "object" && value !== null) {
        appendParam(key, JSON.stringify(value));
      } else {
        appendParam(key, value as QueryValue);
      }
    });

    return searchParams.toString();
  }
}

export default new RestAPI();
