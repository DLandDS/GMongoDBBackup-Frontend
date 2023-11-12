import { PUBLIC_API_BASE_URL } from '$env/static/public';
import { getToastStore } from '@skeletonlabs/skeleton';
import axios from 'axios';

let toastStore: ReturnType<typeof getToastStore>

export default function initializeAxiosConfig() {
	axios.defaults.baseURL = PUBLIC_API_BASE_URL;
    toastStore = getToastStore();

	axios.interceptors.response.use(
		function (response) {
			return response;
		},
		function (error) {
			console.log(error)
			const res = {
				status: error.response?.status,
				message: error.response?.data?.message
			}
			toastStore.trigger({
				message: res.message? `Error ${res.status}: ${res.message}` : error.message || 'Error tidak diketahui',
				background: 'variant-filled-warning'
			});
			return Promise.reject(error);
		}
	);
}
