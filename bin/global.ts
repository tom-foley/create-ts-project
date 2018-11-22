#!/usr/bin/env node
import generate from '../lib/index';

// Delete the 0 and 1 argument (node and script.js)
const args: string[] = process.argv.splice(process.execArgv.length + 2);

// Retrieve the first argument
const projectName: string = args[0];

generate(projectName);