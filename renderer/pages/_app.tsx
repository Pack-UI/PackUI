import React from "react";
import type {AppProps} from "next/app";
import "../styles/globals.css";
import Navbar from "@components/navbar";
import ErrorPopup from "@components/errorPopup";

function PackUI({Component, pageProps}: AppProps) {
	return <>
		<ErrorPopup/>
		<Navbar/>
		<Component {...pageProps} />
	</>;
}

export default PackUI;
