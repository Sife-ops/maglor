import * as t from 'io-ts';

export const ItemEditInput = t.type({
  id: t.string,
  object: t.string,
});
