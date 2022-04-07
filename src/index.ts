import { exec } from "child_process";
import * as t from "io-ts";

const main = async () => {
  exec("bw status", (error, stdout, stderr) => {
    const json = JSON.parse(stdout);
    console.log(json);
  });
};

main();
