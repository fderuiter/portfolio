/* eslint-disable */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import child_process from 'child_process';

describe('build.js script execution', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let exitMock: any;
  let spawnSpy: any;

  beforeEach(() => {
    // Clear require cache for scripts/build.js so it executes on each require call
    delete require.cache[require.resolve('../scripts/build.js')];
    
    originalEnv = { ...process.env };
    exitMock = vi.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`Process exited with code ${code}`);
    });
    spawnSpy = vi.spyOn(child_process, 'spawnSync').mockImplementation(() => ({ status: 0 } as any));
  });

  afterEach(() => {
    process.env = originalEnv;
    exitMock.mockRestore();
    spawnSpy.mockRestore();
  });

  it('runs generate and next build and skips migrations if VERCEL_ENV is not production', () => {
    process.env.VERCEL_ENV = 'preview';
    process.env.DATABASE_URL = 'postgresql://db:5432';

    try {
      require('../scripts/build.js');
    } catch (err: any) {
      expect(err.message).toBe('Process exited with code 0');
    }

    // It should have called prisma generate and next build
    expect(spawnSpy).toHaveBeenCalledWith('npx', ['prisma', 'generate'], expect.any(Object));
    expect(spawnSpy).toHaveBeenCalledWith('npx', ['next', 'build'], expect.any(Object));

    // It should NOT have called check-migrations or prisma migrate deploy
    expect(spawnSpy).not.toHaveBeenCalledWith('node', ['scripts/check-migrations.js'], expect.any(Object));
    expect(spawnSpy).not.toHaveBeenCalledWith('npx', ['prisma', 'migrate', 'deploy'], expect.any(Object));

    // It should exit with 0
    expect(exitMock).toHaveBeenCalledWith(0);
  });

  it('runs migrations if VERCEL_ENV is production', () => {
    process.env.VERCEL_ENV = 'production';
    process.env.DATABASE_URL = 'postgresql://db:5432';

    try {
      require('../scripts/build.js');
    } catch (err: any) {
      expect(err.message).toBe('Process exited with code 0');
    }

    // It should have called prisma generate and next build
    expect(spawnSpy).toHaveBeenCalledWith('npx', ['prisma', 'generate'], expect.any(Object));
    expect(spawnSpy).toHaveBeenCalledWith('npx', ['next', 'build'], expect.any(Object));

    // It SHOULD have called check-migrations and prisma migrate deploy
    expect(spawnSpy).toHaveBeenCalledWith('node', ['scripts/check-migrations.js'], expect.any(Object));
    expect(spawnSpy).toHaveBeenCalledWith('npx', ['prisma', 'migrate', 'deploy'], expect.any(Object));

    // It should exit with 0
    expect(exitMock).toHaveBeenCalledWith(0);
  });

  it('sets dummy DATABASE_URL if none is provided', () => {
    process.env.VERCEL_ENV = 'preview';
    delete (process.env as any).DATABASE_URL;

    try {
      require('../scripts/build.js');
    } catch (err: any) {
      expect(err.message).toBe('Process exited with code 0');
    }

    expect(process.env.DATABASE_URL).toBe('postgresql://dummy:dummy@localhost:5432/dummy');
  });

  it('fails immediately if a build step fails', () => {
    process.env.VERCEL_ENV = 'preview';
    
    // Mock spawnSync to fail on prisma generate (the first call)
    spawnSpy.mockImplementationOnce(() => ({ status: 123 } as any));

    try {
      require('../scripts/build.js');
    } catch (err: any) {
      expect(err.message).toBe('Process exited with code 123');
    }

    // It should have tried prisma generate
    expect(spawnSpy).toHaveBeenCalledWith('npx', ['prisma', 'generate'], expect.any(Object));
    
    // It should NOT have tried next build
    expect(spawnSpy).not.toHaveBeenCalledWith('npx', ['next', 'build'], expect.any(Object));

    // It should exit with the failed code (123)
    expect(exitMock).toHaveBeenCalledWith(123);
  });
});
