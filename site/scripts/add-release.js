#!/usr/bin/env node

/**
 * Release management script for facsimile
 *
 * Usage:
 *   npm run add-release -- --lang fortran --version 1.0.0 --file path/to/binary.tar.gz --platform Linux --arch x86_64 --changelog "Release notes"
 *   npm run add-release -- --lang rust --version 0.2.0 --file path/to/binary.tar.gz --platform macOS --arch arm64 --changelog "Initial release"
 *
 * Or for multiple files:
 *   npm run add-release -- --lang fortran --version 1.0.0 --changelog "Release notes" \
 *     --file path/to/linux.tar.gz --platform Linux --arch x86_64 \
 *     --file path/to/macos-arm.tar.gz --platform macOS --arch "Apple Silicon"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const versionsPath = path.join(__dirname, '..', 'versions.json');

function parseArgs(args) {
  const result = {
    lang: null,
    version: null,
    changelog: '',
    files: []
  };

  let currentFile = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    switch (arg) {
      case '--lang':
      case '-l':
        result.lang = next;
        i++;
        break;
      case '--version':
      case '-v':
        result.version = next;
        i++;
        break;
      case '--changelog':
      case '-c':
        result.changelog = next;
        i++;
        break;
      case '--file':
      case '-f':
        if (currentFile) {
          result.files.push(currentFile);
        }
        currentFile = { path: next, platform: null, arch: null };
        i++;
        break;
      case '--platform':
      case '-p':
        if (currentFile) {
          currentFile.platform = next;
        }
        i++;
        break;
      case '--arch':
      case '-a':
        if (currentFile) {
          currentFile.arch = next;
        }
        i++;
        break;
    }
  }

  if (currentFile) {
    result.files.push(currentFile);
  }

  return result;
}

function validateArgs(args) {
  const errors = [];

  if (!args.lang || !['fortran', 'rust'].includes(args.lang)) {
    errors.push('--lang must be "fortran" or "rust"');
  }

  if (!args.version || !/^\d+\.\d+\.\d+$/.test(args.version)) {
    errors.push('--version must be in format X.Y.Z');
  }

  if (args.files.length === 0) {
    errors.push('At least one --file is required');
  }

  for (const file of args.files) {
    if (!file.path) {
      errors.push('--file path is required');
    } else if (!fs.existsSync(file.path)) {
      errors.push(`File not found: ${file.path}`);
    }

    if (!file.platform) {
      errors.push('--platform is required for each file');
    }

    if (!file.arch) {
      errors.push('--arch is required for each file');
    }
  }

  return errors;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const errors = validateArgs(args);

  if (errors.length > 0) {
    console.error('Errors:');
    errors.forEach(e => console.error(`  - ${e}`));
    console.error('\nUsage:');
    console.error('  npm run add-release -- --lang fortran --version 1.0.0 --file path/to/binary.tar.gz --platform Linux --arch x86_64 --changelog "Release notes"');
    process.exit(1);
  }

  // Read existing versions
  const versions = JSON.parse(fs.readFileSync(versionsPath, 'utf-8'));

  // Prepare release directory
  const releaseDir = path.join(__dirname, '..', 'public', 'releases', args.lang);
  if (!fs.existsSync(releaseDir)) {
    fs.mkdirSync(releaseDir, { recursive: true });
  }

  // Copy files and build file list
  const fileEntries = [];
  for (const file of args.files) {
    const ext = path.extname(file.path);
    const basename = path.basename(file.path);

    // Generate standardized filename
    const archSlug = file.arch.toLowerCase().replace(/\s+/g, '-');
    const platformSlug = file.platform.toLowerCase();
    const filename = `fac-${args.version}-${platformSlug}-${archSlug}${ext}`;

    const destPath = path.join(releaseDir, filename);
    fs.copyFileSync(file.path, destPath);
    console.log(`Copied ${file.path} -> ${destPath}`);

    fileEntries.push({
      filename,
      platform: file.platform,
      arch: file.arch
    });
  }

  // Check if version already exists
  const existingIndex = versions[args.lang].findIndex(v => v.version === args.version);

  const release = {
    version: args.version,
    date: new Date().toISOString().split('T')[0],
    changelog: args.changelog,
    files: fileEntries
  };

  if (existingIndex >= 0) {
    // Update existing version
    versions[args.lang][existingIndex] = release;
    console.log(`Updated ${args.lang} version ${args.version}`);
  } else {
    // Add new version
    versions[args.lang].unshift(release);
    console.log(`Added ${args.lang} version ${args.version}`);
  }

  // Write updated versions
  fs.writeFileSync(versionsPath, JSON.stringify(versions, null, 2) + '\n');
  console.log('Updated versions.json');

  console.log('\nRelease added successfully!');
  console.log('Run `npm run build` to rebuild the site.');
}

main();
