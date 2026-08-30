import { Route } from "./Route.js"
import type { WulfyHandle } from "./types.js"
import { normalizeSegment, segmentatePath } from "./utils.js"

const PARAM = Symbol("parameter")

class Router {
	constructor(
		private readonly segment: string | symbol = "/",
		private readonly parent?: Router,
	) { }

	private readonly childs: Map<string | symbol, Router> = new Map()
	private readonly methods: Map<string, Route> = new Map()

	private contains(router: Router): boolean {
		let current: Router | undefined = router

		while (current) {
			if (current === this) {
				return true
			}

			current = current.parent
		}

		return false
	}

	private prune(router: Router): void {
		while (
			router.parent &&
			router.methods.size === 0 &&
			router.childs.size === 0
		) {
			const parent = router.parent

			parent.childs.delete(router.segment)

			router = parent
		}
	}

	public add(method: string, path: string, handle: WulfyHandle): Route {
		method = method.toUpperCase()
		path = normalizeSegment(path)

		let router: Router
		const params = [] as string[]
		if (path == this.segment) {
			router = this;
		} else {
			const segments = segmentatePath(path)
			router = segments.reduce((r, segment) => {
				const key = segment.type == "parameter" ? PARAM : segment.value;
				if (segment.type == "parameter") {
					params.push(segment.value)
				}

				let router = r.childs.get(key)
				if (!router) {
					router = new Router(key, r)
					r.childs.set(key, router)
				}
				return router
			}, this as Router)
		}

		if (router.methods.has(method)) {
			throw new ReferenceError(`Method ${method} for path "${path}" was been register`)
		}

		const handler = new Route(router, method, handle, params)
		router.methods.set(method, handler)
		return handler
	}

	public remove(route: Route): boolean {
		const router = route.router
		if (!this.contains(router)) {
			return false
		}

		if (!router.methods.delete(route.method)) {
			return false
		}

		this.prune(router)

		return true
	}

	public match(method: string, path: string): RouteMatch | undefined {
		method = method.toUpperCase()
		path = normalizeSegment(path)

		const segments = segmentatePath(path)
		const values: string[] = []

		let router: Router | undefined = this
		for (const segment of segments) {
			if (!router) {
				return undefined
			}

			const staticRouter = router.childs.get(segment.value)

			if (staticRouter) {
				router = staticRouter
				continue
			}

			const paramRouter = router.childs.get(PARAM)

			if (paramRouter) {
				values.push(segment.value)
				router = paramRouter
				continue
			}

			return undefined
		}

		const route = router?.methods.get(method)

		if (!route) {
			return undefined
		}

		const params: Record<string, string> = {}

		for (let i = 0; i < route.params.length; i++) {
			params[route.params[i]!] = values[i]!
		}

		return {
			route,
			params,
		}
	}
}

interface RouteMatch {
	route: Route
	params: Record<string, string>
}

export default Router
