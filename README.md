# About Alcolytics

Is an open source platform for a web and product analytics. 
It consists of a set of components: JavaScript tracking client for web applications; 
server-side data collector; services for geo-coding and detecting client device type; 
a new server deployment system.
[Read more](https://alco.readme.io/docs)

Платформа для web и продуктовой аналитики с открытым исходным кодом.
Включает в себя JavaScript трекер для сайта; сервис получения, обогащения,
сохранения и стриминга данных; сервисы гео-кодинга и определения типа клиентского устройства;
систему развертывания нового сервера.
[Подробнее](https://alco.readme.io/docs) 

![Alcolytics sheme](https://alcolytics.ru/media/alco-scheme.png)

## About AlcoJS library

JavaScript tracking library for web applications. Lets track custom user actions with arbitrary properties. It automatically tracks page views, user activity (browser events from keyboard, focus, mouse, touch), page scroll, interactions with forms and clicks by links. All data is sent to the server-side collector. Comes as a part of Alcolytics platform.

JavaScript библиотека для отслеживания web приложений и передачи  результатов на сервер. События могут сопровождаться произвольным набором параметров. Автоматически отслеживаются: загрузки страниц, активность, скролл, взаимодействия с формами, клики, а также информация об браузере. Является частью платформы Alcolytics.

## Загрузчик основного кода

После запуска платформы Alcolytics вы получите код для установки на сайт, аналогичный этому. 
Лучше всего установить код между `<head>` и `</head>`или сразу после `<body>`. 
Можно поставить через Google Tag Manager, тут есть свои плюсы, минуты и особенности, надо проверять.

![Alcolytics sheme](https://alcolytics.ru/media/snippet.png)

    
Подробнее про установку и настройку на странице [AlcoJS API](https://alco.readme.io/docs/js-api)
 

## События

Обязательно ознакомьтесь с дополнительным сожержимым событий: [Структура собираемых данных](https://alco.readme.io/docs/alcojs-data-format)

### Из коробки

[Автоматические события](https://alco.readme.io/docs/auto-track)

### Семантические

    aclo('event', 'Added to Cart', {
      id: '1231223', 
      name:'Шторка для ванны', 
      categoryName: 'Товары для дома',
      listing: 'best_seller',
    });


## Thanks

- [BrowserStack](https://www.browserstack.com): great tool for manual and automated testing in browser
- [ReadMe](https://readme.io): beautiful tool for product and api documentation


## License

This software is licensed under the MIT license. See [License File](LICENSE) for more information.

