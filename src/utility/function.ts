import util from 'util';
import { exec } from 'child_process';

export const execAsync = util.promisify(exec);

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
