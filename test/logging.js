var winston = require("winston");

winston.remove(winston.transports.Console);

winston.add(winston.transports.Console, 
		{
			level: 'debug',
			colorize: true,
			timestamp: true,
		}
	);