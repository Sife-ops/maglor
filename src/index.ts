#!/usr/bin/env node

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
});

const main = async () => {
  const argv = await parser.argv;

  if (argv.termexec) {
    process.env.TERMEXEC = argv.termexec;
  }

  // f.execAsync('bw sync').then(({ stdout, stderr }) => {
  //   if (stdout) console.log(stdout);
  //   if (stderr) console.log(stderr);
  // });

  // todo: start `bw serve` with maglor?

  let actionsString =
    'C | create\n' +
    'D | delete\n' +
    'E | edit\n' +
    '========================================================================================================================================================================================================\n';

  let itemsString = '';

  const items = await r.listObjectItems();
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
        `echo '${actionsString + itemsString}' | dmenu -i -l 20`
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

        await r.apiRequest('/object/item', item);
      } else if (action === 'D ') {
        /*
         * delete
         */
        console.log('delete item');
      } else if (action === 'E ') {
        /*
         * edit
         */
        console.log('edit item');
      } else {
        const itemIndex = parseInt(result.stdout.split(' ')[0]);

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
    } catch {
      console.log('dmenu terminated by user');
      process.exit(0);
    }
  };

  await dmenuMain();

  process.exit(0);
};

main();
