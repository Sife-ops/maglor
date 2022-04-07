import * as f from './utility/function';
import * as t from './utility/type';
import child_process from 'child_process';
import fetch from 'cross-fetch';
import util from 'util';

// todo: envars for server port

const exec = util.promisify(child_process.exec);

const baseUrl = 'http://localhost:8080';

const main = async () => {
  const response = await fetch(`${baseUrl}/list/object/items`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('HTTP error');
  }

  const json = await response.json();

  const decoded = t.ItemsResponse.decode(json);

  if (decoded._tag === 'Left') {
    throw new Error('Bitwarden API response validation error');
  }

  const { data } = decoded.right.data;

  f.logger(data);
};

main();
