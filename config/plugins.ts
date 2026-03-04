import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
	upload: {
		config: {
			provider: 'aws-s3',
			providerOptions: {
                baseUrl: env('R2_PUBLIC_URL'),
				s3Options: {
					credentials: {
						accessKeyId: env('R2_ACCESS_KEY_ID'),
						secretAccessKey: env('R2_SECRET_ACCESS_KEY'),
					},
					region: 'auto',
					endpoint: env('R2_ENDPOINT'),
					params: {
						Bucket: env('R2_BUCKET_NAME'),
					},
				},
			},
			actionOptions: {
				upload: {},
				delete: {},
			},
			breakpoints: {},
		},
	},
});


export default config;
