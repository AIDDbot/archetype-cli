export function fail(message: string): void {
  process.stderr.write(`error: ${message}\n`);
  process.exitCode = 1;
}
