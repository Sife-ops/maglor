#!/usr/bin/env node

import * as err from './utility/error';
import * as t from './utility/type';
import child_process from 'child_process';
import fetch from 'cross-fetch';
import util from 'util';

// todo: envars for server port
// todo: dmenu settings
// todo: fzf support
// todo: check all passwords for quotation marks
// todo: systemd service for bw serve command
// todo: package for linux
// todo: makefile???

const exec = util.promisify(child_process.exec);

const baseUrl = 'http://localhost:8080';

const main = async () => {
  let response: Response;

  try {
    response = await fetch(`${baseUrl}/list/object/items`, {
      method: 'GET',
    });
  } catch (e) {
    throw err.connectionRefusedError;
  }

  if (!response.ok) {
    throw new Error('HTTP error');
  }

  const json = await response.json();

  const apiResponse = t.ApiResponse.decode(json);
  if (apiResponse._tag === 'Left') throw err.responseValidationError;

  const itemsResponse = t.ItemsResponse.decode(apiResponse.right.data.data);
  if (itemsResponse._tag === 'Left') throw err.responseValidationError;

  const items = itemsResponse.right;

  let itemsString = '';
  for (let i = 0; i < items.length; i++) {
    const { name, login } = items[i];
    const username = login?.username ? login.username : null;
    itemsString = `${itemsString}${i} | ${name} ${
      username ? `| ${username} ` : ''
    }\n`;
  }

  const execDmenu = async () => {
    try {
      const result = await exec(`echo '${itemsString}' | dmenu -i -l 20`);
      const itemIndex = parseInt(result.stdout.split(' ')[0]);
      return items[itemIndex];
    } catch {
      console.log('dmenu terminated by user.');
      process.exit(0);
    }
  };

  const item = await execDmenu();

  if (item.login) {
    const { username, password } = item.login;

    console.log(username);
    console.log(password);

    exec(`echo '${username}' | xclip -i -selection primary`);
    exec(`echo '${password}' | xclip -i -selection clipboard`);

    process.exit(0);
  }
};

main();
