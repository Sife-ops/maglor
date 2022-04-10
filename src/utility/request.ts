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
export const apiRequest = async (e: Endpoint, b?: any) => {
  let response: Response;

  try {
    response = await fetch(`${env.api.url}${e}`, {
      method: b ? 'POST' : 'GET',
      headers: b
        ? {
            'Content-Type': 'application/json',
          }
        : undefined,
      body: b ? JSON.stringify(b) : undefined,
    });
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
  const apiResponse = await apiRequest('/list/object/items');

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
