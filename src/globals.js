import winston from 'winston';
import upath from 'upath';
import { fileURLToPath } from 'url';
import { readFileSync, promises as Fs } from 'fs';


// Set up logger with timestamps and colors, and optional logging to disk file
const logTransports = [];

// CLI options specified when starting Ctrl-Q
let cliOptions = {};

logTransports.push(
    new winston.transports.Console({
        name: 'console',
        level: 'info',
        format: winston.format.combine(
            winston.format.errors({ stack: true }),
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.simple(),
            winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
        ),
    })
);

export const logger = winston.createLogger({
    transports: logTransports,
    format: winston.format.combine(
        winston.format.errors({ stack: true }),
        winston.format.timestamp(),
        winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
});

// Are we running as standalone app or not?
export const isPkg = typeof process.pkg !== 'undefined';
export const execPath = isPkg ? upath.dirname(process.execPath) : process.cwd();

// Get app version from package.json file
// Get app version from package.json file
const filenamePackage = `./package.json`;
let a;
let b;
let c;
// Are we running as a packaged app?
if (isPkg) {
    // Get path to JS file
    a = process.pkg.defaultEntrypoint;

    // Strip off the filename
    b = upath.dirname(a);

    // Add path to package.json file
    c = upath.join(b, filenamePackage);
} else {
    // Get path to JS file
    a = fileURLToPath(import.meta.url);

    // Strip off the filename
    b = upath.dirname(a);

    // Add path to package.json file, which resides in the parent directory
    c = upath.join(b, '..', filenamePackage);
}


const { version } = JSON.parse(readFileSync(c));
export const appVersion = version;

// Functions to get/set current console logging level
export const getLoggingLevel = () => logTransports.find((transport) => transport.name === 'console').level;

export const setLoggingLevel = (newLevel) => {
    logTransports.find((transport) => transport.name === 'console').level = newLevel;
};

export function sleep(ms) {
    // eslint-disable-next-line no-promise-executor-return
    return new Promise((resolve) => setTimeout(resolve, ms));
}
