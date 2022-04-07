import * as t from 'io-ts';
import child_process from 'child_process';
import { promisify } from 'util';

const exec = promisify(child_process.exec);

const statusResponse = t.type({
  serverUrl: t.union([t.string, t.null]),
  lastSync: t.union([t.string, t.null]),
  userEmail: t.union([t.string, t.undefined]),
  userId: t.union([t.string, t.undefined]),
  status: t.string,
});

const main = async () => {

  // // todo: handle error?
  // const { stdout, stderr } = await exec('bw status');
  // const json = JSON.parse(stdout);
  // const decoded = statusResponse.decode(json);
  // if (decoded._tag === 'Left') {
  //   throw new Error('response validation error');
  // }
  // const status = decoded.right;
  // if (status.status !== 'unlocked') {
  //   throw new Error('not unlocked');
  // }
  // console.log('ok')

};

main();
