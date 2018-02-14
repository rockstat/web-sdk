# About Alcolytics

Is an open source platform for a web and product analytics. 
It consists of a set of components: JavaScript tracking client for web applications; 
server-side data collector; services for geo-coding and detecting client device type; 
a new server deployment system.
[Read more](https://alco.readme.io/docs/web-tracking)

Платформа для web и продуктовой аналитики с открытым исходным кодом.
Включает в себя JavaScript трекер для сайта; сервис получения, обогащения,
сохранения и стриминга данных; сервисы гео-кодинга и определения типа клиентского устройства;
систему развертывания нового сервера.
[Подробнее](https://alco.readme.io/docs/web-tracking) 

![Alcolytics sheme](https://raw.githubusercontent.com/alcolytics/alco-tracker/master/docs/alco-scheme.png)

## About AlcoJS library

JavaScript tracking library for web applications. Lets track custom user actions with arbitrary properties. It automatically tracks page views, user activity (browser events from keyboard, focus, mouse, touch), page scroll, interactions with forms and clicks by links. All data is sent to the server-side collector. Comes as a part of Alcolytics platform.

JavaScript библиотека для отслеживания web приложений и передачи  результатов на сервер. События могут сопровождаться произвольным набором параметров. Автоматически отслеживаются: загрузки страниц, активность, скролл, взаимодействия с формами, клики, а также информация об браузере. Является частью платформы Alcolytics.

## Before you start

- [Вводная информация по отслеживанию событий](https://alco.readme.io/docs/web-tracking)
- [AlcoJS API](https://alco.readme.io/docs/js-api) 

### Использование localStorage

AlcoJS хранит все данные в браузере и чтобы избежать их передачи на сервер при каждом запросе (как делают куки), 
для хранения используется localStorage. Он поддерживается 97% браузеров. 

Но есть особенности связанные с localStorage:

- www.вашсайт и вашсайт это разные сайты для localStorage.
- http://вашсайт и https://вашсайт это опять же разные сайты для localStorage

Для большинства сайтов это не будет проблемой т.к. используется либо http либо https (с редиректом с http),
аналогичная ситуация с www.

Известные проблемы:

- Не работает в режиме инкогнито на iPhone и др



## Thanks for open source support

- [BrowserStack](https://www.browserstack.com): great tool for manual and automated testing in browser
- [ReadMe](https://readme.io): beautiful tool for product and api documentation


## License

This software is licensed under the MIT license. See [License File](LICENSE) for more information.

