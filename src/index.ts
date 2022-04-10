#!/usr/bin/env node

import * as c from './utility/constant';
import * as f from './utility/function';
import * as r from './utility/request';
import * as t from './utility/type';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// todo: dmenu settings
// todo: check all passwords for quotation marks
// todo: systemd service for bw serve command :(

const parser = yargs(hideBin(process.argv)).options({
  termexec: { type: 'string' },
  url: { type: 'string' },
});

const main = async () => {
  const argv = await parser.argv;

  if (argv.termexec) {
    process.env.TERMEXEC = argv.termexec;
  } else if (!process.env.TERMEXEC) {
    process.env.TERMEXEC = 'xterm -e';
  }

  if (argv.url) {
    process.env.BW_CLI_API_URL = argv.url;
  } else {
    process.env.BW_CLI_API_URL = 'http://localhost:8087';
  }

  const items = await r.listObjectItems();

  let itemsString = '';
  for (let i = 0; i < items.length; i++) {
    const { name, login } = items[i];
    const username = login?.username ? login.username : null;
    itemsString = `${itemsString}${i} | ${name} ${
      username ? `| ${username} ` : ''
    }\n`;
  }

  try {
    const selected = await f.execAsync(
      `echo '${c.actionsString + itemsString}' | dmenu -i -l 20`
    );
    const action = selected.stdout[0];

    if (action === 'C') {
      /*
       * create
       */
      // todo: support all item types
      const template = await f.getTemplateItemLogin();
      const item = await f.editTempFile(template);

      // todo: validate
      await r.apiPostRequest('/object/item', item);
    } else if (action === 'D' || action === 'E') {
      /*
       * delete/edit
       */
      const selected = await f.execAsync(
        `echo '${itemsString}' | dmenu -i -l 20`
      );
      const itemIndex = parseInt(selected.stdout.split(' ')[0]);
      const item = items[itemIndex];

      if (action === 'D') {
        await r.apiDeleteRequest(item);
      } else if (action === 'E') {
        const json = await f.editTempFile(item);

        const itemEditInput = t.ItemEditInput.decode(json);
        if (itemEditInput._tag === 'Left') {
          throw new Error('input validation error');
        }

        await r.apiPutRequest(itemEditInput.right);
      }
    } else {
      /*
       * default
       */
      const itemIndex = parseInt(selected.stdout.split(' ')[0]);
      const item = items[itemIndex];

      // todo: delegate to shellscript
      if (item.login) {
        const { username, password } = item.login;

        console.log(username);
        console.log(password);

        f.execAsync(`echo '${username}' | xclip -i -selection primary`);
        f.execAsync(`echo '${password}' | xclip -i -selection clipboard`);
      }
    }
  } catch (e) {
    // console.log('dmenu terminated by user');
    console.log(e);
    process.exit(1);
  }

  // todo: run `bw sync`?

  process.exit(0);
};

main();
