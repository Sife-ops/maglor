import fs from 'fs';
import util from 'util';
import { exec } from 'child_process';

export const execAsync = util.promisify(exec);

export const mktemp = async (): Promise<string> => {
  const result = await execAsync('mktemp');
  return result.stdout.split('\n')[0];
};

export const getTemplate = async (s: string) => {
  // todo: use xdg spec
  const cacheDir = `${process.env.HOME}/.cache/maglor/template`;
  const cacheFile = `${cacheDir}/${s}`;

  if (fs.existsSync(cacheFile)) {
    const json = fs.readFileSync(cacheFile, 'utf8');
    // todo: move to main function?
    // exec(`bw get template ${s}`, (error, stdout, stderr) => {
    //   fs.writeFileSync(cacheFile, stdout);
    //   console.log('updated cache');
    // });
    return JSON.parse(json);
  } else {
    const result = await execAsync(`bw get template ${s}`);
    fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(cacheFile, result.stdout);
    console.log('created cache');
    return JSON.parse(result.stdout);
  }
};

export const getTemplateItemLogin = async () => {
  const item = await getTemplate('item');
  const login = await getTemplate('item.login');
  const uri = await getTemplate('item.login.uri');
  return {
    ...item,
    login: {
      ...login,
      uris: [uri],
    },
  };
};

export const getTemplateItemSecureNote = async () => {
  const item = await getTemplate('item');
  const secureNote = await getTemplate('item.secureNote');
  return {
    ...item,
    type: 2,
    secureNote,
  };
};

export const getTemplateItemCard = async () => {
  const item = await getTemplate('item');
  const card = await getTemplate('item.card');
  return {
    ...item,
    type: 3,
    card,
  };
};

export const getTemplateItemIdentity = async () => {
  const item = await getTemplate('item');
  const identity = await getTemplate('item.identity');
  return {
    ...item,
    type: 4,
    identity,
  };
};

export const editTempFile = async (a: any): Promise<any> => {
  const tempFile = await mktemp();
  fs.writeFileSync(tempFile, JSON.stringify(a, null, 2));
  await execAsync(`${process.env.TERMEXEC} $EDITOR ${tempFile}`);
  return JSON.parse(fs.readFileSync(tempFile, 'utf8'));
};

export const logger = (o: any) => {
  console.log(
    util.inspect(o, {
      colors: true,
      depth: null,
      maxArrayLength: null,
      showHidden: false,
    })
  );
};
