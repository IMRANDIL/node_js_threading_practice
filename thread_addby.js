const { Worker, isMainThread, parentPort } = require("worker_threads");
const { Mutex } = require("async-mutex"); //not required

// Share data between threads
let databaseValue = 0;

if (isMainThread) {
    async function runService() {
        const promises = [];
        const numThreads = 10;
        for (let i = 0; i < numThreads; i++) {
            promises.push(new Promise((resolve, reject) => {
                const worker = new Worker(__filename);
                worker.on("message", resolve);
                worker.on("error", reject);
                worker.on("exit", (code) => {
                    if (code !== 0)
                        reject(new Error(`Worker stopped with exit code ${code}`));
                });
            }));
        }
        const results = await Promise.all(promises);
        databaseValue = results.reduce((acc, val) => acc + val, 0);
        console.log('Final value:', databaseValue);
    }

    runService().catch((err) => console.error(err));
} else {
    function increase() {
        return 100; // Each worker increases the value by 100
    }

    const result = increase();
    parentPort.postMessage(result); // Send the result back to the main thread
}

















// const { Worker, isMainThread, parentPort, workerData } = require("worker_threads");
// const { Mutex } = require("async-mutex");

// // Share data between threads
// let databaseValue = 0;

// if (isMainThread) {
//     async function runService() {
//         return new Promise((resolve, reject) => {
//             const worker = new Worker(__filename, { workerData: { addBy: 100 } });
//             worker.on("message", resolve);
//             worker.on("error", reject);
//             worker.on("exit", (code) => {
//                 if (code !== 0)
//                     reject(new Error(`Worker stopped with exit code ${code}`));
//             });
//         });
//     }

//     async function run() {
//         const result = await runService();
//         databaseValue += result; // Update databaseValue based on the result from the worker
//         console.log('result>>>>>>>>>', result);
//     }

//     run().catch((err) => console.error(err));
//     console.log("I should run immediately");
// } else {
//     function increase(addBy) {
//         return addBy; // Return the value to be added
//     }

//     const result = increase(workerData.addBy);
//     parentPort.postMessage(result); // Send the result back to the main thread
// }
