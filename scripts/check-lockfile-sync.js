#!/usr/bin/env node
/* eslint-disable */
const fs = require('fs');
const path = require('path');

function getPackageLockVersion(packageLock, pkgName) {
  if (packageLock.packages) {
    const pkgObj = packageLock.packages[`node_modules/${pkgName}`];
    if (pkgObj && pkgObj.version) {
      return pkgObj.version;
    }
  }
  if (packageLock.dependencies && packageLock.dependencies[pkgName]) {
    return packageLock.dependencies[pkgName].version || null;
  }
  return null;
}

function getBunLockVersion(bunLock, pkgName) {
  if (bunLock.packages) {
    // 1. Direct key match
    const pkgArr = bunLock.packages[pkgName];
    if (pkgArr && Array.isArray(pkgArr) && typeof pkgArr[0] === "string") {
      const val = pkgArr[0];
      const lastAtIndex = val.lastIndexOf('@');
      if (lastAtIndex !== -1) {
        return val.substring(lastAtIndex + 1);
      }
    }
    // 2. Fallback search (e.g. nested packages or aliased paths)
    for (const key of Object.keys(bunLock.packages)) {
      const parts = key.split('/');
      if (parts[parts.length - 1] === pkgName || key === pkgName) {
        const arr = bunLock.packages[key];
        if (arr && Array.isArray(arr) && typeof arr[0] === "string") {
          const val = arr[0];
          const lastAtIndex = val.lastIndexOf('@');
          if (lastAtIndex !== -1) {
            const parsedName = val.substring(0, lastAtIndex);
            if (parsedName === pkgName) {
              return val.substring(lastAtIndex + 1);
            }
          }
        }
      }
    }
  }
  return null;
}

function checkLockfiles() {
  const root = path.resolve(__dirname, '..');
  const packageJsonPath = path.join(root, 'package.json');
  const packageLockPath = path.join(root, 'package-lock.json');
  const bunLockPath = path.join(root, 'bun.lock');

  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ package.json not found');
    process.exit(1);
  }

  if (!fs.existsSync(packageLockPath)) {
    console.error('❌ package-lock.json not found');
    process.exit(1);
  }

  if (!fs.existsSync(bunLockPath)) {
    console.error('❌ bun.lock not found');
    process.exit(1);
  }

  let packageJson, packageLock, bunLock;
  try {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageLock = JSON.parse(fs.readFileSync(packageLockPath, 'utf8'));
    
    let bunLockContent = fs.readFileSync(bunLockPath, 'utf8');
    bunLockContent = bunLockContent.replace(/,(\s*[\]}])/g, '$1');
    bunLock = JSON.parse(bunLockContent);
  } catch (err) {
    console.error('❌ Failed to parse package or lock files:', err.message);
    process.exit(1);
  }

  const dependencies = {
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {}),
  };

  const mismatches = [];

  for (const pkgName of Object.keys(dependencies)) {
    const npmVer = getPackageLockVersion(packageLock, pkgName);
    const bunVer = getBunLockVersion(bunLock, pkgName);

    if (!npmVer && !bunVer) {
      mismatches.push(`${pkgName} (missing from both lockfiles)`);
    } else if (!npmVer) {
      mismatches.push(`${pkgName} (missing from package-lock.json, bun has ${bunVer})`);
    } else if (!bunVer) {
      mismatches.push(`${pkgName} (missing from bun.lock, npm has ${npmVer})`);
    } else if (npmVer !== bunVer) {
      mismatches.push(`${pkgName} (npm resolved: ${npmVer}, bun resolved: ${bunVer})`);
    }
  }

  if (mismatches.length > 0) {
    console.error('\n❌ [LOCKFILE DESYNCHRONIZATION DETECTED]');
    console.error(`Found ${mismatches.length} desynchronized lockfile dependency/dependencies:`);
    mismatches.forEach(m => console.error(`  - ${m}`));
    console.error('\n👉 Please run the synchronization command locally before submitting PR:');
    console.error('   npm run sync');
    console.error('   or');
    console.error('   npm run doctor:fix\n');
    process.exit(1);
  }

  console.log('✅ Lockfiles are fully synchronized.');
  process.exit(0);
}

checkLockfiles();
