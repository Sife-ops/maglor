import * as t from 'io-ts';
import fetch from 'cross-fetch';

const apiResponseValidationError = new Error(
  'Bitwarden API response validation error.'
);

const ApiResponse = t.type({
  success: t.boolean,
  // todo: just use `t.unknown`?
  data: t.union([t.unknown, t.undefined]),
});

const apiRequest = async (endpoint: string, init: RequestInit) => {
  let response: Response;

  try {
    response = await fetch(`${process.env.BW_CLI_API_URL}${endpoint}`, init);
  } catch (e) {
    throw new Error('connection to Bitwarden CLI RESI API was refused');
  }

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status} ${response.statusText}`);
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
    throw apiResponseValidationError;
  }

  if (!apiResponse.right.success) {
    throw new Error('request unsuccessful');
  }

  return apiResponse.right;
};

type GetEndpoint = '/generate' | '/list/object/items';
export const apiGetRequest = async (endpoint: GetEndpoint) => {
  return await apiRequest(endpoint, { method: 'GET' });
};

type PostEndpoint = '/object/item';
export const apiPostRequest = async (endpoint: PostEndpoint, body: any) => {
  return await apiRequest(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
};

export const apiDeleteRequest = async (item: {
  id: string;
  object: string;
}) => {
  return await apiRequest(`/object/${item.object}/${item.id}`, {
    method: 'DELETE',
  });
};

export const apiPutRequest = async (item: { id: string; object: string }) => {
  return await apiRequest(`/object/${item.object}/${item.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  });
};

const Item = t.type({
  id: t.string,
  name: t.string,
  object: t.string,
  type: t.number,
  login: t.union([
    t.type({
      username: t.union([t.string, t.null]),
      password: t.union([t.string, t.null]),
    }),
    t.undefined,
  ]),
});

const ListObjectItems = t.type({
  data: t.array(Item),
});

export const listObjectItems = async () => {
  const apiResponse = await apiGetRequest('/list/object/items');

  const listObjectItems = ListObjectItems.decode(apiResponse.data);
  if (listObjectItems._tag === 'Left') {
    console.log(listObjectItems.left);
    throw apiResponseValidationError;
  }

  return listObjectItems.right.data;
};

// todo: status action
// const StatusResponse = t.type({
//   serverUrl: t.union([t.string, t.null]),
//   lastSync: t.union([t.string, t.null]),
//   userEmail: t.union([t.string, t.undefined]),
//   userId: t.union([t.string, t.undefined]),
//   status: t.string,
// });
