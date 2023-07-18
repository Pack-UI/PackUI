import { NotificationManager } from 'react-notifications';

export default class Notifications {
	public static info(info: string) {
		NotificationManager.info(info);
	}

	public static success(success: string) {
		NotificationManager.success(success);
	}

	public static warning(warning: string) {
		NotificationManager.warning(warning);
	}

	public static error(error: string) {
		NotificationManager.error(error);
	}
}
