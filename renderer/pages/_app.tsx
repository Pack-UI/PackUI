import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import Navbar from '@components/navbar';
import ErrorPopup from '@components/errorPopup';
import { useRouter } from 'next/router';

const isProd = process.env.NODE_ENV === 'production';

function PackUI({ Component, pageProps }: AppProps) {
	const router = useRouter();

	useEffect(() => {
		let location = window.location;

		if (isProd) {
			if (!location.href.includes('.html')) {
				// Split string at ?, add html and recombine (needed for cases like /info?id=0
				const urlSplit = location.href.split('?');
				urlSplit[0] = urlSplit[0] + '.html';
				const htmlUrl = urlSplit.join('?');
				location.replace(htmlUrl);
			}
		}

		// Run everytime on path change
	}, [router.asPath]);

	return (
		<>
			<ErrorPopup />
			<Navbar />
			<Component {...pageProps} />
		</>
	);
}

export default PackUI;
