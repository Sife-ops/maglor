import * as t from 'io-ts';
import child_process from 'child_process';
import fetch from 'cross-fetch';
import util from 'util';

// todo: envars for server port

const exec = util.promisify(child_process.exec);

const baseUrl = 'http://localhost:8080';

const logger = (o: any) => {
  console.log(
    util.inspect(o, {
      colors: true,
      depth: null,
      maxArrayLength: null,
      showHidden: false,
    })
  );
};

// const StatusResponse = t.type({
//   serverUrl: t.union([t.string, t.null]),
//   lastSync: t.union([t.string, t.null]),
//   userEmail: t.union([t.string, t.undefined]),
//   userId: t.union([t.string, t.undefined]),
//   status: t.string,
// });

const bwResponse = (data: any) => {
  return t.type({
    success: t.boolean,
    data: t.type({
      object: t.string,
      data,
    }),
  });
};

const ItemsResponse = bwResponse(
  t.array(
    t.type({
      id: t.string,
      name: t.string,
      type: t.number,
    })
  )
);

const main = async () => {
  const response = await fetch(`${baseUrl}/list/object/items`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('HTTP error');
  }

  const json = await response.json();

  const decoded = ItemsResponse.decode(json);

  if (decoded._tag === 'Left') {
    throw new Error('Bitwarden API response validation error');
  }

  // console.log(decoded);
  // return;

  const { data } = decoded.right.data;

  logger(data);
};

main();
