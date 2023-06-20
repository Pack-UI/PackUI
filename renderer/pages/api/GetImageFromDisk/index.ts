import {NextApiRequest, NextApiResponse} from 'next';
import * as fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const filePath = path.join(String(req.query['file']));
	const stat = fs.statSync(filePath);

	res.writeHead(200, {
		'Content-Type': 'image/png',
		'Content-Length': stat.size,
	});

	const readStream = fs.createReadStream(filePath);
	await new Promise(resolve => {
		readStream.pipe(res);
		readStream.on('end', resolve);
	});
}
