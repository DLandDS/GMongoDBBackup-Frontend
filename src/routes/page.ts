import moment from 'moment';

export type Server = {
	id: string;
	name: string;
	uri: string;
	interval: number;
	lastBackup: string;
};

export type ServerDisplay = {
	status?: string;
} & Server;


export function parseTime(time: string): string {
	const now = moment();
	const date = moment(time);
	const diffMinutes = now.diff(date, 'minutes');
	const diffHours = now.diff(date, 'hours');
	const diffDays = now.diff(date, 'days');

	if (diffMinutes < 1) {
		return "just now";
	} else if (diffHours < 1) {
		return `${diffMinutes}m ago`;
	} else if (diffDays < 1) {
		return `${diffHours}h ago`;
	} else {
		return date.format("YYYY-MM-DD HH:mm:ss");
	}
}


