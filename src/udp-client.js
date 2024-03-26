import { Command, Option } from 'commander';
import winston from 'winston';
import { logger, appVersion, isPkg, getLoggingLevel, setLoggingLevel } from './globals.js';
import dgram from'node:dgram';

// Get command line arguments
const program = new Command();

// Set the name of the program (to be used in help text)
program.name('ctrl-q');

// Set help text to be shown after errors
program.showHelpAfterError('(add --help for additional information about required and optional parameters)');

// Help text configuration
program.configureHelp({
    sortSubcommands: true,
});



/**
 * Top level async function.
 * Workaround to deal with the fact that Node.js doesn't currently support top level async functions...
 */
(async () => {
    let msg;

    // Basic app info
    program
        .version(appVersion)
        .description(
            `"Butler UDP Client" is a general purpose, command line utility for sending UDP messages.\nIt was first designed to be used with the Butler and Butler SOS tools, but can be used with any UDP server.\n\nNote: Some commands are specific to the Butler and Butler SOS tools and can be useful\nwhen investigating connection issues fom Qlik Sense to the Butler tools.\n\nApp version: ${appVersion}`
        )
        .hook('preAction', (thisCommand, actionCommand) => {
            const options = actionCommand.opts();
        })
        .addOption(
            new Option('-l, --log-level <level>', 'log level').choices(['error', 'warn', 'info', 'verbose', 'debug', 'silly']).default('info')
        )
        .requiredOption('-h, --host <host>', 'IP or hostname of UDP server')
        .requiredOption('-p, --port <port>', 'port number of UDP server')

        .requiredOption('-m, --msg <message>', 'message to send', 'Test message');


    // Parse command line params
    await program.parseAsync(process.argv);
    const options = program.opts();

    // Set logging level
    setLoggingLevel(options.logLevel);

    // Show startup info
    logger.info('--------------------------------------');
    logger.info('Butler UDP Client');
    logger.info('');
    logger.info(`Log level         : ${getLoggingLevel()}`);
    logger.info(`Version           : ${appVersion}`);
    logger.verbose('');
    logger.verbose(`Running as           : ${isPkg ? 'standalone app' : 'source code'}`);
    logger.verbose(`Command line options : ${JSON.stringify(options)}`);
    logger.info('--------------------------------------');



    const client = dgram.createSocket({
        type: 'udp4',
        reuseAddr: true,
    });
        
    msg = Buffer.from(options.msg);
    
    try {
        logger.info(`Sending UDP message "${msg}"`);
        client.send(msg, 0, msg.length, options.port, options.host, (err, bytes) => {
            if (err) throw err;
            
            logger.info(`UDP message sent to ${options.host}:${options.port}, ${bytes} bytes.`);
            client.close();
        });
    } catch (err) {
        logger.error(`Error sending UDP message: ${err}`);
    }
})();
