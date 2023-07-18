import { NotificationManager } from 'react-notifications';

export default class Notifications {
	public static info(
		message: string,
		title: string = '',
		timeOut: number = 4000,
		callback: Function = () => {},
		priority: boolean = false
	) {
		NotificationManager.info(message, title, timeOut, callback, priority);
	}

	public static success(
		message: string,
		title: string = '',
		timeOut: number = 4000,
		callback: Function = () => {},
		priority: boolean = false
	) {
		NotificationManager.success(message, title, timeOut, callback, priority);
	}

	public static warning(
		message: string,
		title: string = '',
		timeOut: number = 4000,
		callback: Function = () => {},
		priority: boolean = false
	) {
		NotificationManager.warning(message, title, timeOut, callback, priority);
	}

	public static error(
		message: string,
		title: string = '',
		timeOut: number = 4000,
		callback: Function = () => {},
		priority: boolean = false
	) {
		NotificationManager.error(message, title, timeOut, callback, priority);
	}
}
