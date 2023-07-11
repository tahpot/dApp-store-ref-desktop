const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		appDir: true,
	},
	eslint: {
		// Warning: This allows production builds to successfully complete even if
		// your project has ESLint errors.
		// ignoreDuringBuilds: true,
	},
	i18n: {
		locales: ["en"],
		defaultLocale: "en",
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**",
			},
			{
				protocol: "http",
				hostname: "**",
			},
		],
	},
	reactStrictMode: false,

	transpilePackages: ['monaco-editor', 'react-monaco-editor'],

	webpack: (config) => {
		config.resolve.fallback = { fs: false, net: false, tls: false };

		const rule = config.module.rules
			.find(rule => rule.oneOf)
			.oneOf.find(
				r =>
					// Find the global CSS loader
					r.issuer && r.issuer.include && r.issuer.include.includes("_app")
			);

		if (rule) {
			rule.issuer.include = [
				rule.issuer.include,
				// Allow `monaco-editor` to import global CSS:
				/[\\/]node_modules[\\/]monaco-editor[\\/]/
			];
		}

		config.plugins.push(new MonacoWebpackPlugin({
			languages: [
			  "json",
			],
			filename: "static/[name].worker.js"
		}));

		return config;
	},
	optimizeFonts: false,
};

module.exports = nextConfig;
