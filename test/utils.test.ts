import { describe, expect, it } from 'vitest'
import { normalizeSegment, segmentatePath } from '../src/utils.js'

describe("Segmentation path", () => {
	const tests: Record<string, string[]> = {
		"/": [],
		"/user": ["user"],
		"/user/:id": ['user', ':id'],
		"/user/test": ['user', "test"],
		"/user/*": ['user', "*"]
	}

	for (const path in tests) {
		it(`Path "${path}"`, () => {
			expect(segmentatePath(path)).toEqual(tests[path])
		})
	}
})

describe("Normalize segments", () => {
	const tests: Record<string, string> = {
		"user": "/user",
		"/user": "/user",
		"/user/": "/user",
	}
	for (const segment in tests) {
		it(`Path "${segment}"`, () => {
			expect(normalizeSegment(segment)).toEqual(tests[segment])
		})
	}
})
