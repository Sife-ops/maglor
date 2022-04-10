import * as t from 'io-ts';

// todo: ItemCreateInput

export const ItemEditInput = t.type({
  id: t.string,
  object: t.string,
});
