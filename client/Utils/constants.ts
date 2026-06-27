// Base URL of the backend that serves the API. Empty string => same-origin
// (relative paths), which is the dev default. Trailing slashes are trimmed so
// joining with a leading-slash path never produces a double slash.
export const BASE_BACKEND_URL: string = (
  process.env.NEXT_PUBLIC_BASE_BACKEND_URL ?? ""
).replace(/\/+$/, "");

/** Prefix an API path with the backend base URL. */
const api = (path?: string): string => `${BASE_BACKEND_URL}${path ?? ""}`;

export const BASE_URL: string | undefined = process.env.NEXT_PUBLIC_BASE_URL;
export const MONGO_URL: string | undefined = process.env.MONGO_URL;
export const SECRET_KEY: string | undefined = process.env.SECRET_KEY;
export const LOGIN_API: string = api(process.env.NEXT_PUBLIC_LOGIN_API);
export const REGISTER_API: string = api(process.env.NEXT_PUBLIC_REGISTER_API);
export const VERIFY_USER: string = api(process.env.NEXT_PUBLIC_VERIFY_USER);
export const GET_ATTEMPTED_TEST: string = api(process.env.NEXT_PUBLIC_GET_ATTEMPTED_TEST);
export const GET_TOP_N_CANDIDATES: string = api(process.env.NEXT_PUBLIC_GET_TOP_N_CANDIDATES);
export const GET_ASSIGNMENTS: string = api(process.env.NEXT_PUBLIC_GET_ASSIGNMENTS);
export const GET_CANDIDATES_ADMIN: string = api(process.env.NEXT_PUBLIC_GET_CANDIDATES_ADMIN);
export const CONTACT_US: string = api(process.env.NEXT_PUBLIC_CONTACT_US);
export const UPDATE_ASSIGNMENT: string = api(process.env.NEXT_PUBLIC_UPDATE_ASSIGNMENT);
