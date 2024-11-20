import js from 'eslint-config-janus/js.js'
import ts from 'eslint-config-janus/ts.js'
import jest from 'eslint-config-janus/jest.js'
import { jsify, tsify } from 'eslint-config-janus/utils.js'

const testGlob = 'test/**/*.spec.ts'

const ignoreArr = [{ ignores: ['built/**/*'] }]
const jsArr = jsify(js)
const tsConfig = {
	languageOptions: {
		parserOptions: {
			projectService: true,
			// project: 'tsconfig.json',
			// tsconfigRootDir: import.meta.url,
		},
	},
}
const tsArr = tsify(ts, { ignores: [testGlob] })
tsArr.push(...tsify([tsConfig], { ignores: [testGlob] }))
const testTsArr = tsify(ts, { files: [testGlob] })
const testTsConfig = {
	languageOptions: {
		parserOptions: {
			project: './tsconfig.json',
			tsconfigRootDir: './test',
		},
	},
}
testTsArr.push(...tsify([testTsConfig], { files: [testGlob] }))
testTsArr.push(...tsify(jest, { files: [testGlob] }))

export default [
	...ignoreArr,
	...jsArr,
	...tsArr,
	...testTsArr,
]

