# Wulfy 0.3
<img src="public/icon.svg" width="250" title="Temporary icon Wulfy"/> [^1]

# ENV Variables

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
```json
{
	//Path to controllers
	"controllers": [
		"controllers/**/*,js"
	]
}

```

# TODO
- [x] Controllers Router
- [x] Statics Router
- [ ] Errors Router (from controllers?)
- [ ] \(???) Services (templates, models, etc.)


[^1]: Icon download from [svgrepo.con](https://www.svgrepo.com/svg/89615/wolf-head)
