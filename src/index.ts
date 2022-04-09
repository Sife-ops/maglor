#!/usr/bin/env node

import * as f from './utility/function';
import * as r from './utility/request';

// todo: envars for server port
// todo: dmenu settings
// todo: check all passwords for quotation marks
// todo: systemd service for bw serve command

const main = async () => {
  f.execAsync('bw sync').then(({ stdout, stderr }) => {
    if (stdout) console.log(stdout);
    if (stderr) console.log(stderr);
  });

  let itemsString =
    'A | add\n' +
    'D | delete\n' +
    'E | edit\n' +
    '========================================================================================================================================================================================================\n';

  const items = await r.listObjectItems();
  for (let i = 0; i < items.length; i++) {
    const { name, login } = items[i];
    const username = login?.username ? login.username : null;
    itemsString = `${itemsString}${i} | ${name} ${
      username ? `| ${username} ` : ''
    }\n`;
  }

  // todo: not a function
  const dmenuMain = async () => {
    try {
      const result = await f.execAsync(
        `echo '${itemsString}' | dmenu -i -l 20`
      );

      const first = result.stdout.split('|')[0];

      if (first === 'A ') {
        console.log('add item');
      } else if (first === 'D ') {
        console.log('delete item');
      } else if (first === 'E ') {
        console.log('edit item');
      } else {
        const itemIndex = parseInt(result.stdout.split(' ')[0]);

        const item = items[itemIndex];

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
