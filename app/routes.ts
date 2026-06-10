import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route('/auth', 'routes/auth.tsx'),
	route('/upload', 'routes/upload.tsx'),
	route ('/resume/:id', 'routes/resume.tsx'),
	route('/api/auth/*', 'routes/api/auth.$.ts'),
	route('/api/files', 'routes/api/files.ts'),
	route('/api/files/:id', 'routes/api/files.$id.ts'),
	route('/api/resumes', 'routes/api/resumes.ts'),
	route('/api/resumes/:id', 'routes/api/resumes.$id.ts'),
	route('/api/analyze', 'routes/api/analyze.ts'),
] satisfies RouteConfig;
