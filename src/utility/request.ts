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
    data: t.array(t.type({})),
  }),
});

const apiRequest = async (s: string) => {
  let response: Response;

  try {
    response = await fetch(`${env.api.url}${s}`, {
      method: 'GET',
    });
  } catch (e) {
    throw new Error('Connection to Bitwarden CLI RESI API was refused.');
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
  if (apiResponse._tag === 'Left') throw responseValidationError;

  return apiResponse.right;
};

const ItemsResponse = t.array(
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

  const itemsResponse = ItemsResponse.decode(apiResponse.data.data);
  if (itemsResponse._tag === 'Left') throw responseValidationError;

  return itemsResponse.right;
};

// const StatusResponse = t.type({
//   serverUrl: t.union([t.string, t.null]),
//   lastSync: t.union([t.string, t.null]),
//   userEmail: t.union([t.string, t.undefined]),
//   userId: t.union([t.string, t.undefined]),
//   status: t.string,
// });
