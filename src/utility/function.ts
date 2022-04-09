import util from 'util';
import { exec } from 'child_process';

export const execAsync = util.promisify(exec);

export const mktemp = async (): Promise<string> => {
  const result = await execAsync('mktemp');
  return result.stdout.split('\n')[0];
};

export const getTemplate = async (s: string) => {
  let result = await execAsync(`bw get template ${s}`);
  let stdout = result.stdout;
  return JSON.parse(stdout);
};

export const getTemplateItemLogin = async () => {
  const item = await getTemplate('item');
  const itemLogin = await getTemplate('item.login');
  const itemLoginUri = await getTemplate('item.login.uri');
  return {
    ...item,
    login: {
      ...itemLogin,
      uris: [itemLoginUri],
    },
  };
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
