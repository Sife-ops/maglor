import * as t from './utility/type';
import child_process from 'child_process';
import fetch from 'cross-fetch';
import util from 'util';

// todo: envars for server port

const exec = util.promisify(child_process.exec);

const baseUrl = 'http://localhost:8080';

const responseValidationError = new Error(
  'Bitwarden API response validation error'
);

const main = async () => {
  let response: Response;

  try {
    response = await fetch(`${baseUrl}/list/object/items`, {
      method: 'GET',
    });
  } catch (e) {
    throw new Error('connection refused');
  }

  if (!response.ok) {
    throw new Error('HTTP error');
  }

  const json = await response.json();

  const bwResponse = t.BwResponse.decode(json);
  if (bwResponse._tag === 'Left') throw responseValidationError;

  const itemsResponse = t.ItemsResponse.decode(bwResponse.right.data.data);
  if (itemsResponse._tag === 'Left') throw responseValidationError;

  let items = '';
  for (const item of itemsResponse.right) {
    const { id, name } = item;
    items = `${items}${name} | ${id} \n`;
  }

  let itemId = '';
  try {
    const result = await exec(`echo '${items}' | dmenu -l 20`);
    const outputArray = result.stdout.split(' ');
    itemId = outputArray[outputArray.length - 2];
    // console.log(itemId);
  } catch {
    process.exit(0);
  }

  // todo: dynamically change object type
  response = await fetch(`${baseUrl}/object/item/${itemId}`, {
    method: 'GET',
  });

  console.log(await response.json());
};

main();
