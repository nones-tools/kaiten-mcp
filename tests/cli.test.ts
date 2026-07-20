import { describe, expect, it } from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CLI_PATH = path.join(import.meta.dir, '..', 'src', 'cli', 'index.ts');

interface CliResult {
  exitCode: number | null;
  stdout: string;
  stderr: string;
}

// Spawns the CLI as a real subprocess (`bun src/cli/index.ts ...`) rather than
// importing it directly, since the module calls process.exit() and runs
// its logic at import time - importing it in-process would kill the test
// runner. cwd is a fresh temp dir and KAITEN_* env vars (plus HOME, so
// `~/.kaiten/config` can't leak in) are stripped so no real credentials or
// config files are picked up and no network calls can succeed.
function runCli(args: string[]): CliResult {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kaiten-cli-test-'));
  try {
    const env: Record<string, string> = {};
    for (const [key, value] of Object.entries(process.env)) {
      if (value === undefined || key.startsWith('KAITEN_')) continue;
      env[key] = value;
    }
    env.HOME = tmpDir;

    const result = Bun.spawnSync(['bun', CLI_PATH, ...args], {
      cwd: tmpDir,
      env,
      stdout: 'pipe',
      stderr: 'pipe',
    });

    return {
      exitCode: result.exitCode,
      stdout: result.stdout.toString(),
      stderr: result.stderr.toString(),
    };
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

describe('cli', () => {
  it('help prints the usage text and exits 0', () => {
    const { exitCode, stdout, stderr } = runCli(['help']);
    expect(stderr).toBe('');
    expect(exitCode).toBe(0);
    expect(stdout).toContain('Kaiten CLI - Полнофункциональный CLI для Kaiten API');
    expect(stdout).toContain('kaiten <command> [args]');
    expect(stdout).toContain("git-branch <card_id>             - Создать ветку для задачи");
    expect(stdout).toContain('--minimal, -m');
  });

  it('--help and -h behave the same as help', () => {
    for (const flag of ['--help', '-h']) {
      const { exitCode, stdout } = runCli([flag]);
      expect(exitCode).toBe(0);
      expect(stdout).toContain('Kaiten CLI - Полнофункциональный CLI для Kaiten API');
    }
  });

  it('an unknown command exits 1 and mentions the command', () => {
    const { exitCode, stderr } = runCli(['bogus-command']);
    expect(exitCode).toBe(1);
    expect(stderr).toContain('Unknown command: bogus-command');
  });

  it('"card" with no ID exits 1 with "Error: Card ID required" and makes no network call', () => {
    const { exitCode, stderr } = runCli(['card']);
    expect(exitCode).toBe(1);
    expect(stderr).toContain('Error: Card ID required');
  });

  it('"card-simple" with no ID exits 1 with "Error: Card ID required"', () => {
    const { exitCode, stderr } = runCli(['card-simple']);
    expect(exitCode).toBe(1);
    expect(stderr).toContain('Error: Card ID required');
  });

  it('"git-branch" with no ID exits 1 with "Error: Card ID required"', () => {
    const { exitCode, stderr } = runCli(['git-branch']);
    expect(exitCode).toBe(1);
    expect(stderr).toContain('Error: Card ID required');
  });
});
