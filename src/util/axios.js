import axios, { Axios, AxiosInstance, AxiosResponse, AxiosStatic } from 'axios';

class Api {
	http = null;

	constructor(axios, baseURL) {
		this.http = axios.create({
			baseURL,
		});
	}

	getAxios() {
		return this.http;
	}	

	setBaseHeader(userConfig = {}) {
		const config = {
			...userConfig,
            ...!('headers' in userConfig) && {
                headers: {
                    'Content-Type': 'application/json',
                }
            },
		};

		return config;
	}

	get(path, params = {}, config = {}) {
        if(this.http === null) {
            return;
        }
		config = this.setBaseHeader(config);
		return this.http.get(path, { params, ...config });
	}

	post(path, params = {}, config = {}) {
        if(this.http === null) {
            return null;
        }
		config = this.setBaseHeader(config);
		return this.http.post(path, params, config);
	}

	postForm(path, formData, onProgress) {
		if(this.http === null) {
            return null;
        }

		return this.http.post(path, formData, {
			onUploadProgress: (e) => {
				if(onProgress) {
					onProgress(e);
				}				
			},
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		});

	}

	async getAsync(path, params = {}, config = {}) {
        if(this.http === null) {
            return;
        }
		config = this.setBaseHeader(config);
		const response = await this.http.get(path, { params, ...config });
		return response;
	}
}
console.log(`${process.env.REACT_APP_API_URL}${process.env.REACT_APP_API_PREFIX}`);

const apiService = new Api(axios, `${process.env.REACT_APP_API_URL}${process.env.REACT_APP_API_PREFIX}`);
export default apiService;
