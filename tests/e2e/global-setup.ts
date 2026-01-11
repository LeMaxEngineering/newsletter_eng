import { spawn } from 'node:child_process';
import net from 'node:net';
import { setTimeout as delay } from 'node:timers/promises';

function run(command: string, args: string[], timeoutMs = 60_000) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' });
    const timeout = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error(`Command ${command} ${args.join(' ')} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    child.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    child.on('close', (code) => {
      clearTimeout(timeout);
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
      }
    });
  });
}

async function waitForPort(host: string, port: number, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await new Promise<void>((resolve, reject) => {
        const socket = net.createConnection({ host, port }, () => {
          socket.end();
          resolve();
        });
        socket.once('error', (error) => {
          socket.destroy();
          reject(error);
        });
      });
      return;
    } catch (error) {
      console.warn(`Waiting for ${host}:${port}... (${(error as Error).message})`);
      await delay(1_000);
    }
  }
  throw new Error(`Timed out waiting for ${host}:${port}`);
}

export default async function globalSetup() {
  console.log('Ensuring PostgreSQL docker service is running...');
  try {
    await run('docker', ['compose', 'up', 'postgres', '-d']);
  } catch (error) {
    throw new Error(`Failed to start postgres service via docker compose: ${(error as Error).message}`);
  }

  const host = process.env.PG_HOST ?? '127.0.0.1';
  const port = Number(process.env.PG_PORT ?? 5432);
  await waitForPort(host, port);
  console.log(`PostgreSQL reachable at ${host}:${port}`);
}
