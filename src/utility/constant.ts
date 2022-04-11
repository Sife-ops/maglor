// todo: itemTypeString

export const actionsString =
  'C | create\n' +
  'D | delete\n' +
  'E | edit\n' +
  'S | status\n' +
  '========================================================================================================================================================================================================\n';

export const confirmDialog = 'Are you sure?\nyes\nno';
// todo: why is DMENU_CMD undefined?
export const confirmCmd = `echo '${confirmDialog}' | ${process.env.DMENU_CMD}`;
