# Wulfy 0.3
[ [EN](README.MD) | **RU** ]

<img src="public/icon.svg" width="250" title="Temporary icon Wulfy"/> [^1]

# ENV Переменные
Вы можете использовать файл ".env" для определения переменных окружения.
```ini
# Порт для HTTP-Сервера
HTTP_PORT = 80 

# Порт для HTTPS-Сервера
HTTPS_PORT = 433 
# Переадрисация на HTTPS-Сервер
TLS_REDIRECT = false
# Приватный ключ для HTTPS-Сервера
PRIVATE_KEY = "key"
# Файл с приватным ключем для HTTPS-Сервера
PRIVATE_KEY_FILE = "path/to/file.key"
# Сертификат для HTTPS-Сервера
CERTIFICATE = "cert"
# Файл с сертификатам для HTTPS-Сервера
CERTIFICATE_FILE = "path/to/file.cert"

# Конфиг-файл
CONFIG_FILE = "path/to/config.json"
```

# Конфиг
Путь к файлу определен переменной окружения "CONFIG_FILE". По умолчанию "config.json".  
Пример конфиг-файла:
```jsonc
{
	//Путь к контрллерам
	"controllers": [
		"path/to/controllers",
		"controllers/**/*.js"
	],
	//Список путей со статикой
	"static": {
		"/starts_url": ["path/to/static/folder1", "path/to/static/folder2"],
		"/": "public"
	},
	//Путь к контроллерам с обработчиками ошибок
	"error": [
		"path/to/controllers",
		"controllers/error.js",
	]
}

```

# TODO
- [x] Роутер Контроллеров
- [x] Роутер Статики
- [x] Роутер Ошибок
- [ ] \(???) Сервисы (Шаблоны, модели и т.д.)
- [ ] Внешние модули
- [ ] Переменные для Конфиг-файла
- [ ] CLI

[^1]: Иконка загружена с сайта [svgrepo.con](https://www.svgrepo.com/svg/89615/wolf-head)
