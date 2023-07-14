import http from 'http';
import fs from 'fs';
import path from 'path';
import Logger from 'electron-log';
import Config from './helpers/config';

export default class ImageServer {
	readonly port: number;
	readonly server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;

	constructor() {
		const config = new Config();
		this.port = config.port;

		this.server = http.createServer((req, res) => {
			const filePath = path.join(config.customSongsFolder, decodeURIComponent(req.url));

			const extname = path.extname(filePath);
			let contentType = 'text/html';
			switch (extname) {
				case '.png':
					contentType = 'image/png';
					break;
				case '.jpg':
					contentType = 'image/jpg';
					break;
				case '.jpeg':
					contentType = 'image/jpeg';
					break;
				case '.gif':
					contentType = 'image/gif';
					break;
				case '.svg':
					contentType = 'image/svg+xml';
					break;
			}

			fs.readFile(filePath, (e, content) => {
				if (e) {
					Logger.error(e);
					res.writeHead(404);
					res.end();
				} else {
					res.writeHead(200, { 'Content-Type': contentType });
					res.end(content, 'utf-8');
				}
			});
		});
	}

	startServer() {
		Logger.log(`Starting web server on port ${this.port}`);
		this.server.listen(this.port);
	}

	closeServer() {
		this.server.close(Logger.error);
	}
}
