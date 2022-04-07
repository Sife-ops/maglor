import { exec } from "child_process";

const main = async () => {
  exec("bw status", (error, stdout, stderr) => {
    const json = JSON.parse(stdout);
    console.log(json);
  });
};

main();
