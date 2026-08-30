import { describe, expect, it } from 'vitest'
import Router from '../src/Router.js'

const _void = () => void 0

describe('Router base', () => {
	it('matches registered routes', () => {
		const router = new Router()

		const getUsers = router.add('GET', '/users', _void)

		const match = router.match('GET', '/users')
		expect(match).toBeDefined();
		expect(match?.route).toBe(getUsers);
		expect(match?.params).toEqual({});
	})

	it('returns undefined for unknown path', () => {
		const router = new Router()

		router.add('GET', '/users', _void)

		expect(router.match('GET', '/unknown')).toBeUndefined()
	})

	it('returns undefined for unregistered method', () => {
		const router = new Router()

		router.add('GET', '/users', _void)

		expect(router.match('POST', '/users')).toBeUndefined()
	})

	it('supports multiple methods for the same path', () => {
		const router = new Router()

		const get = router.add('GET', '/users', _void)
		const post = router.add('POST', '/users', _void)

		expect(router.match('GET', '/users')).toBe(get)
		expect(router.match('POST', '/users')).toBe(post)
	})

	it('normalizes route paths', () => {
		const router = new Router()

		const route = router.add('GET', 'users', _void)

		expect(router.match('GET', '/users')).toBe(route)
		expect(router.match('GET', 'users')).toBe(route)
		expect(router.match('GET', 'users/')).toBe(route)
		expect(router.match('GET', '/users/')).toBe(route)
	})

	it('throws when registering duplicate method and path', () => {
		const router = new Router()

		router.add('GET', '/users', _void)

		expect(() => {
			router.add('GET', '/users', _void)
		}).toThrow(ReferenceError)
	})
})

describe("Router.remove()", () => {
	it("removes a route", () => {
		const router = new Router();

		const route = router.add("GET", "/users", _void);

		expect(router.match("GET", "/users")).toBe(route);

		expect(router.remove(route)).toBe(true);

		expect(router.match("GET", "/users")).toBeUndefined();
	});

	it("returns false when route is already removed", () => {
		const router = new Router();

		const route = router.add("GET", "/users", _void);

		expect(router.remove(route)).toBe(true);
		expect(router.remove(route)).toBe(false);
	});

	it("does not remove route from an unrelated router", () => {
		const router = new Router();
		const other = new Router();

		const route = router.add("GET", "/users", _void);

		expect(other.remove(route)).toBe(false);
		expect(router.match("GET", "/users")).toBe(route);
	});

	it("allows a parent router to remove a child route", () => {
		const router = new Router();

		const route = router.add("GET", "/users", _void);

		expect(router.remove(route)).toBe(true);
		expect(router.match("GET", "/users")).toBeUndefined();
	});

	it("allows an ancestor router to remove a deeply nested route", () => {
		const router = new Router();

		const route = router.add(
			"GET",
			"/users/posts/comments",
			_void,
		);

		expect(router.remove(route)).toBe(true);
		expect(router.match("GET", "/users/posts/comments")).toBeUndefined();
	});

	it("removes only the specified method", () => {
		const router = new Router();

		const get = router.add("GET", "/users", _void);
		const post = router.add("POST", "/users", _void);

		expect(router.remove(get)).toBe(true);

		expect(router.match("GET", "/users")).toBeUndefined();
		expect(router.match("POST", "/users")).toBe(post);
	});

	it("removes empty route nodes", () => {
		const router = new Router();

		const route = router.add("GET", "/users/posts", _void);

		expect(router.match("GET", "/users/posts")).toBe(route);

		router.remove(route);

		expect(router.match("GET", "/users/posts")).toBeUndefined();
		expect(router.match("GET", "/users")).toBeUndefined();
	});

	it("prunes the entire empty branch", () => {
		const router = new Router();

		const route = router.add(
			"GET",
			"/users/posts/comments",
			_void,
		);

		router.remove(route);

		expect(router.match("GET", "/users/posts/comments")).toBeUndefined();
		expect(router.match("GET", "/users/posts")).toBeUndefined();
		expect(router.match("GET", "/users")).toBeUndefined();
	});

	it("does not prune a node that still has routes", () => {
		const router = new Router();

		const get = router.add("GET", "/users", _void);
		const post = router.add("POST", "/users", _void);

		router.remove(get);

		expect(router.match("GET", "/users")).toBeUndefined();
		expect(router.match("POST", "/users")).toBe(post);
	});

	it("does not prune a node that still has children", () => {
		const router = new Router();

		const users = router.add("GET", "/users", _void);
		const posts = router.add("GET", "/users/posts", _void);

		router.remove(users);

		expect(router.match("GET", "/users")).toBeUndefined();
		expect(router.match("GET", "/users/posts")).toBe(posts);
	});

	it("can remove a route from a parent without affecting sibling routes", () => {
		const router = new Router();

		const users = router.add("GET", "/users", _void);
		const posts = router.add("GET", "/posts", _void);

		expect(router.remove(users)).toBe(true);

		expect(router.match("GET", "/users")).toBeUndefined();
		expect(router.match("GET", "/posts")).toBe(posts);
	});
});

describe("Router — parameterized routes", () => {
	it("matches a route with one parameter", () => {
		const router = new Router();

		const route = router.add("GET", "/users/:id", () => { });

		const match = router.match("GET", "/users/123");

		expect(match).toBeDefined();
		expect(match?.route).toBe(route);
		expect(match?.params).toEqual({
			id: "123",
		});
	});

	it("matches a route with multiple parameters", () => {
		const router = new Router();

		const route = router.add(
			"GET",
			"/users/:userId/posts/:postId",
			() => { },
		);

		const match = router.match(
			"GET",
			"/users/123/posts/456",
		);

		expect(match).toBeDefined();
		expect(match?.route).toBe(route);
		expect(match?.params).toEqual({
			userId: "123",
			postId: "456",
		});
	});

	it("matches parameter values containing numbers", () => {
		const router = new Router();

		const route = router.add("GET", "/users/:id", () => { });

		const match = router.match("GET", "/users/42");

		expect(match?.route).toBe(route);
		expect(match?.params).toEqual({
			id: "42",
		});
	});

	it("matches arbitrary parameter values", () => {
		const router = new Router();

		const route = router.add("GET", "/users/:id", () => { });

		const match = router.match("GET", "/users/hello-world");

		expect(match?.route).toBe(route);
		expect(match?.params).toEqual({
			id: "hello-world",
		});
	});

	it("does not match when parameter segment is missing", () => {
		const router = new Router();

		router.add("GET", "/users/:id", () => { });

		expect(
			router.match("GET", "/users"),
		).toBeUndefined();
	});

	it("does not match when the path has additional segments", () => {
		const router = new Router();

		router.add("GET", "/users/:id", () => { });

		expect(
			router.match("GET", "/users/123/profile"),
		).toBeUndefined();
	});

	it("prefers a static route over a parameterized route", () => {
		const router = new Router();

		const parameterized = router.add(
			"GET",
			"/users/:id",
			() => { },
		);

		const staticRoute = router.add(
			"GET",
			"/users/me",
			() => { },
		);

		const match = router.match("GET", "/users/me");

		expect(match?.route).toBe(staticRoute);
		expect(match?.route).not.toBe(parameterized);
		expect(match?.params).toEqual({});
	});

	it("uses parameterized route when static route does not match", () => {
		const router = new Router();

		const route = router.add(
			"GET",
			"/users/:id",
			() => { },
		);

		router.add(
			"GET",
			"/users/me",
			() => { },
		);

		const match = router.match("GET", "/users/123");

		expect(match?.route).toBe(route);
		expect(match?.params).toEqual({
			id: "123",
		});
	});

	it("allows the same parameterized path for different methods", () => {
		const router = new Router();

		const get = router.add(
			"GET",
			"/users/:id",
			() => { },
		);

		const post = router.add(
			"POST",
			"/users/:id",
			() => { },
		);

		expect(router.match("GET", "/users/123")?.route).toBe(get);
		expect(router.match("POST", "/users/123")?.route).toBe(post);
	});

	it("does not allow duplicate parameterized routes with different parameter names", () => {
		const router = new Router();

		router.add("GET", "/users/:id", () => { });

		expect(() => {
			router.add("GET", "/users/:name", () => { });
		}).toThrow(ReferenceError);
	});

	it("keeps parameter names independent between routes", () => {
		const router = new Router();

		const user = router.add(
			"GET",
			"/users/:userId",
			() => { },
		);

		const post = router.add(
			"GET",
			"/posts/:postId",
			() => { },
		);

		const userMatch = router.match("GET", "/users/123");
		const postMatch = router.match("GET", "/posts/456");

		expect(userMatch?.route).toBe(user);
		expect(userMatch?.params).toEqual({
			userId: "123",
		});

		expect(postMatch?.route).toBe(post);
		expect(postMatch?.params).toEqual({
			postId: "456",
		});
	});

	it("supports a parameter at the root level", () => {
		const router = new Router();

		const route = router.add("GET", "/:id", () => { });

		const match = router.match("GET", "/123");

		expect(match?.route).toBe(route);
		expect(match?.params).toEqual({
			id: "123",
		});
	});

	it("supports consecutive parameterized segments", () => {
		const router = new Router();

		const route = router.add(
			"GET",
			"/users/:userId/:postId",
			_void,
		);

		const match = router.match(
			"GET",
			"/users/123/456",
		);

		expect(match?.route).toBe(route);
		expect(match?.params).toEqual({
			userId: "123",
			postId: "456",
		});
	});
});
