import * as t from 'io-ts';
import fetch from 'cross-fetch';
import { env } from './constant';

const responseValidationError = new Error(
  'Bitwarden API response validation error.'
);

const ApiResponse = t.type({
  success: t.boolean,
  data: t.type({
    object: t.string,
    // todo: need unknown?
    data: t.union([t.unknown, t.undefined]),
  }),
});

type Endpoint = '/generate' | '/list/object/items' | '/object/item';
const apiRequest = async (endpoint: Endpoint, init: RequestInit) => {
  let response: Response;

  try {
    response = await fetch(`${env.api.url}${endpoint}`, init);
  } catch (e) {
    throw new Error('connection to Bitwarden CLI RESI API was refused');
  }

  if (!response.ok) {
    throw new Error('HTTP error');
  }

  let json;
  try {
    json = await response.json();
  } catch (e) {
    throw new Error('JSON parse error');
  }

  const apiResponse = ApiResponse.decode(json);
  if (apiResponse._tag === 'Left') {
    console.log(apiResponse.left);
    throw responseValidationError;
  }

  if (!apiResponse.right.success) {
    throw new Error('request unsuccessful');
  }

  return apiResponse.right;
};

type Get = '/generate' | '/list/object/items';
export const apiGetRequest = async (endpoint: Get) => {
  return await apiRequest(endpoint, { method: 'GET' });
};

type Post = '/object/item';
export const apiPostRequest = async (endpoint: Post, body: any) => {
  return await apiRequest(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
};

const ListObjectItems = t.array(
  t.type({
    id: t.string,
    name: t.string,
    type: t.number,
    login: t.union([
      t.type({
        username: t.union([t.string, t.null]),
        password: t.union([t.string, t.null]),
      }),
      t.undefined,
    ]),
  })
);

export const listObjectItems = async () => {
  const apiResponse = await apiGetRequest('/list/object/items');

  const listObjectItems = ListObjectItems.decode(apiResponse.data.data);
  if (listObjectItems._tag === 'Left') {
    console.log(listObjectItems.left);
    throw responseValidationError;
  }

  return listObjectItems.right;
};

// const StatusResponse = t.type({
//   serverUrl: t.union([t.string, t.null]),
//   lastSync: t.union([t.string, t.null]),
//   userEmail: t.union([t.string, t.undefined]),
//   userId: t.union([t.string, t.undefined]),
//   status: t.string,
// });
