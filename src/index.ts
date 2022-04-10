#!/usr/bin/env node

import * as c from './utility/constant';
import * as f from './utility/function';
import * as r from './utility/request';
import fs from 'fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// todo: envars for server port
// todo: dmenu settings
// todo: check all passwords for quotation marks
// todo: systemd service for bw serve command

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

  // todo: not as function
  const dmenuMain = async () => {
    try {
      const result = await f.execAsync(
        `echo '${c.actionsString + itemsString}' | dmenu -i -l 20`
      );

      const action = result.stdout.split('|')[0];

      if (action === 'C ') {
        /*
         * create
         */
        const template = await f.getTemplateItemLogin();
        const tempFile = await f.mktemp();
        fs.writeFileSync(tempFile, JSON.stringify(template, null, 2));
        await f.execAsync(`${process.env.TERMEXEC} $EDITOR ${tempFile}`);

        const itemJson = fs.readFileSync(tempFile, 'utf8');
        const item = JSON.parse(itemJson);

        await r.apiPostRequest('/object/item', item);
      } else if (action === 'D ') {
        /*
         * delete
         */
        const result = await f.execAsync(
          `echo '${itemsString}' | dmenu -i -l 20`
        );

        const itemIndex = parseInt(result.stdout.split(' ')[0]);
        const item = items[itemIndex];

        await r.apiDeleteRequest(item);
      } else if (action === 'E ') {
        /*
         * edit
         */
        console.log('edit item');
      } else {
        /*
         * default
         */
        const itemIndex = parseInt(result.stdout.split(' ')[0]);
        const item = items[itemIndex];
        console.log(item);

        // todo: delegate to shellscript
        if (item.login) {
          const { username, password } = item.login;

          console.log(username);
          console.log(password);

          f.execAsync(`echo '${username}' | xclip -i -selection primary`);
          f.execAsync(`echo '${password}' | xclip -i -selection clipboard`);
        }
      }
    } catch {
      console.log('dmenu terminated by user');
      process.exit(0);
    }
  };

  await dmenuMain();

  process.exit(0);
};

main();
