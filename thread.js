const {
    Worker,
    isMainThread,
    workerData,
    parentPort,
  } = require("worker_threads");
  const sharp = require("sharp");
  
  if (isMainThread) {
    function runService() {
      return new Promise((resolve, reject) => {
        const worker = new Worker(__filename, {
          workerData: {
            imagePath: "input.jpg",
            outputPath: "output.jpg",
            width: 24000,
            height: 16000,
          },
        });
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
    console.log("Resizing image");
  } else {
    const { imagePath, outputPath, width, height } = workerData;
  
    sharp(imagePath)
      .resize(width, height)
      .toFile(outputPath, (err) => {
        if (err) {
          throw err;
        }
        // Send a message back to the main thread
        parentPort.postMessage("Image resized successfully!");
      });
  }