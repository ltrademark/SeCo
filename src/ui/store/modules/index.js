const moduleFiles = import.meta.glob('./*.js', { eager: true })
const modules = {}

for (const path in moduleFiles) {
	if (path === './index.js') continue
	const name = path.replace(/^\.\//, '').replace(/\.js$/, '')
	modules[name] = moduleFiles[path].default
}

export default modules
