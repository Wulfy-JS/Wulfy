import { describe, expect, it } from 'vitest'
import { normalizeSegment, segmentatePath, type Segment } from '../src/utils.js'

describe("Segmentation path", () => {
	const tests: Record<string, Segment[]> = {
		"/": [],
		"/user": [
			{
				type: "static",
				value: "user",
			}
		],
		"/user/:id": [
			{
				type: "static",
				value: "user",
			},
			{
				type: "parameter",
				value: "id",
			}
		],
		"/user/test": [
			{
				type: "static",
				value: "user",
			},
			{
				type: "static",
				value: "test",
			},
		],
		"/user/*": [
			{
				type: "static",
				value: "user",
			},
			{
				type: "static",
				value: "*",
			},
		]
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
