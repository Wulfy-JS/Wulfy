interface Segment {
	type: "static" | "parameter"
	value: string
}

function segmentatePath(path: string): Segment[] {
	const s = path.split("/");
	s.shift();
	if (s[s.length - 1] === "") s.pop();
	return s.map(segment => {
		if (segment[0] === ":") {
			return { type: "parameter", value: segment.slice(1) }
		}
		return { type: "static", value: segment }
	});
}

function normalizeSegment(segment: string) {
	if (segment[0] != "/") {
		segment = "/" + segment
	}

	if (segment[segment.length - 1] == "/") {
		segment = segment.slice(0, -1)
	}

	return segment
}

export {
	type Segment,
	segmentatePath,
	normalizeSegment
}
