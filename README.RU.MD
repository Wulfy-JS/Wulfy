# Wulfy 0.3
[ [EN](README.MD) | **RU** ]

<img src="public/icon.svg" width="250" title="Temporary icon Wulfy"/> [^1]

# Конфиг
Путь к файлу определен переменной окружения "CONFIG_FILE". По умолчанию "config.json".  
Пример конфиг-файла:
```jsonc
{
	//Конфигурация сервера
	"server":{
		// Порт для HTTP-Сервера
		"http_port": 80,
		// Порт для HTTPS-Сервера (Опционально. Игнорируется без "certificate" и "private_key")
		"https_port": 443,
		// Переадрисация на HTTPS-Сервер (Опционально. Игнорируется без "certificate" и "private_key")
		"tls_redirect": true,
		// Файл с приватным ключем для HTTPS-Сервера (Опционально. Обязательно с "certificate")
		"private_key": "path/to/file.key",
		// Файл с сертификатам для HTTPS-Сервера (Опционально. Обязательно с "private_key")
		"certificate": "path/to/file.cert"
	},
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
- [x] Сервисы (Шаблоны, модели и т.д.)
- [ ] Кластеры
- [ ] Внешние модули
- [ ] Переменные для Конфиг-файла
- [ ] CLI
- [ ] Lifecicle

[^1]: Иконка загружена с сайта [svgrepo.con](https://www.svgrepo.com/svg/89615/wolf-head)
