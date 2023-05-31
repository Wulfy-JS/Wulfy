# Wulfy 0.3
[ **EN** | [RU](README.RU.MD) ]

<img src="public/icon.svg" width="250" title="Temporary icon Wulfy"/> [^1]

# Config
The path to the file is defined by the "CONFIG_FILE" environment variable. Default "config.json".  
Example config-file:
```jsonc
{
	// Config server
	"server":{
		// Port for HTTP-Server
		"http_port": 80,
		// Port for HTTPS-Server (Optional. Ignored without "certificate" and "private_key")
		"https_port": 443,
		// Redirect to HTTPS-Server (Optional. Ignored without "certificate" and "private_key")
		"tls_redirect": true,
		// File with Private Key for HTTPS-Server (Optional. Required with "certificate")
		"private_key": "path/to/file.key",
		// File with Certificate for HTTPS-Server (Optional. Required with "private_key")
		"certificate": "path/to/file.cert",
		// Amount of CPU used.
		// If 0 is specified, the maximum possible will be used.
		// If higher than possible is specified, the maximum possible will be used.
		"cpus": 0
	},
	// Path to controllers
	"controllers": [
		"path/to/controllers",
		"controllers/**/*.js"
	],
	// List static dirs
	"static": {
		"/starts_url": ["path/to/static/folder1", "path/to/static/folder2"],
		"/": "public"
	},
	// Path to services
	"services": [
		"path/to/services"
	],
	// Path to controllers with error handlers
	"error": [
		"path/to/controllers",
		"controllers/error.js",
	]
}

```

# TODO
- [x] Controllers Router
- [x] Statics Router
- [x] Errors Router
- [x] Services (templates, models, etc.)
- [x] Clusters
- [ ] External modules
- [x] Variables for Config-File
- [ ] CLI
- [ ] Lifecicle

[^1]: Icon download from [svgrepo.con](https://www.svgrepo.com/svg/89615/wolf-head)
