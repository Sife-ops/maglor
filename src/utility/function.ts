import util from 'util';

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

