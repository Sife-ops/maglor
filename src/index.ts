#!/usr/bin/env node

import * as f from './utility/function';
import * as r from './utility/request';

// todo: envars for server port
// todo: dmenu settings
// todo: fzf support
// todo: check all passwords for quotation marks
// todo: systemd service for bw serve command
// todo: package for linux
// todo: makefile???

const main = async () => {
  f.execAsync('bw sync').then(({ stdout, stderr }) => {
    if (stdout) console.log(stdout);
    if (stderr) console.log(stderr);
  });

  const items = await r.listObjectItems();

  let itemsString = '';
  for (let i = 0; i < items.length; i++) {
    const { name, login } = items[i];
    const username = login?.username ? login.username : null;
    itemsString = `${itemsString}${i} | ${name} ${
      username ? `| ${username} ` : ''
    }\n`;
  }

  const dmenuItemsList = async () => {
    try {
      const result = await f.execAsync(
        `echo '${itemsString}' | dmenu -i -l 20`
      );
      const itemIndex = parseInt(result.stdout.split(' ')[0]);
      return items[itemIndex];
    } catch {
      console.log('dmenu terminated by user');
      process.exit(0);
    }
  };

  const item = await dmenuItemsList();

  if (item.login) {
    const { username, password } = item.login;

    console.log(username);
    console.log(password);

    f.execAsync(`echo '${username}' | xclip -i -selection primary`);
    f.execAsync(`echo '${password}' | xclip -i -selection clipboard`);

    process.exit(0);
  }
};

main();
