# Wulfy 0.3
[ **EN** | [RU](README.RU.MD) ]

<img src="public/icon.svg" width="250" title="Temporary icon Wulfy"/> [^1]

# ENV Variables
You can use ".env" file to define environment variables

```ini
# Port for HTTP-Server
HTTP_PORT = 80 

# Port for HTTPS-Server
HTTPS_PORT = 433 
# Redirect to HTTPS-Server
TLS_REDIRECT = false
# Private Key for HTTPS-Server
PRIVATE_KEY = "key"
# File with Private Key for HTTPS-Server
PRIVATE_KEY_FILE = "path/to/file.key"
# Certificate for HTTPS-Server
CERTIFICATE = "cert"
# File with Certificate for HTTPS-Server
CERTIFICATE_FILE = "path/to/file.cert"

# Config-File
CONFIG_FILE = "path/to/config.json"
```

# Config
The path to the file is defined by the "CONFIG_FILE" environment variable. Default "config.json".  
Example config-file:
```jsonc
{
	//Path to controllers
	"controllers": [
		"path/to/controllers",
		"controllers/**/*.js"
	],
	//List static dirs
	"static": {
		"/starts_url": ["path/to/static/folder1", "path/to/static/folder2"],
		"/": "public"
	},
	//Path to controllers with error handlers
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
- [ ] \(???) Services (templates, models, etc.)
- [ ] Threads
- [ ] External modules
- [ ] Variables for Config-File
- [ ] CLI
- [ ] Lifecicle

[^1]: Icon download from [svgrepo.con](https://www.svgrepo.com/svg/89615/wolf-head)
