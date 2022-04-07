import * as t from 'io-ts';

export const BwResponse = t.type({
  success: t.boolean,
  data: t.type({
    object: t.string,
    data: t.array(t.type({}))
  }),
});

export const ItemsResponse = t.array(
  t.type({
    id: t.string,
    name: t.string,
    type: t.number,
  })
);

// const StatusResponse = t.type({
//   serverUrl: t.union([t.string, t.null]),
//   lastSync: t.union([t.string, t.null]),
//   userEmail: t.union([t.string, t.undefined]),
//   userId: t.union([t.string, t.undefined]),
//   status: t.string,
// });
