import { spawn } from 'node:child_process';


// execute shell command (3-second timeout)
export function execute(cmd, args = [], timeout = 3000) {

  const result = [];

  return new Promise((resolve, reject) => {

    try {

      const
        controller = new AbortController(),
        exec = spawn(cmd, args, {
          timeout,
          signal: controller.signal
        });

      exec.stdout.on('data', addResult);
      exec.stderr.on('data', addResult);

      exec.on('error', err => {
        addResult(err.message);
        controller.abort();
      });

      exec.on('close', code => {

        resolve({
          complete: !code,
          code,
          result
        });

      });

    }
    catch(err) {

      addResult(err.message);

      reject({
        complete: false,
        code: err.errno,
        result
      });

    }

  });

  // append to result
  function addResult(data) {

    if (Buffer.isBuffer(data)) data = data.toString('utf8');
    data = data.toString().trim();
    if (data) result.push(data);

  }

}
