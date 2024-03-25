const {
  Worker,
  isMainThread,
  workerData,
  parentPort,
} = require("worker_threads");
const crypto = require("crypto");

if (isMainThread) {
  function runService() {
    return new Promise((resolve, reject) => {
      const worker = new Worker(__filename, { workerData: "world" });
      worker.on("message", resolve);
      worker.on("error", reject);
      worker.on("exit", (code) => {
        if (code !== 0)
          reject(new Error(`Worker stopped with exit code ${code}`));
      });
    });
  }

  async function run() {
    const result = await runService("world");
    console.log(result);
  }

  run().catch((err) => console.error(err));
  console.log("I should run immediately");
} else {
  const codes = [];
  for (let i = 0; i < 5000; i++) {
    const val = doHeavyStuff(`${workerData}-${i + 1}`);
    codes.push(val);
  }

  function doHeavyStuff(item) {
    return crypto
      .createHmac("sha256", "secret")
      .update(new Array(10000).fill(item).join("."))
      .digest("hex");
  }
  parentPort.postMessage(codes);
}
