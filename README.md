# Alcolytics

Is an open source platform for a web and product analytics. It consists of a set of components: JavaScript tracking client for web applications; server-side data collector; services for geo-coding and detecting client device type; a new server deployment system.

Платформа для web и продуктовой аналитики с открытым исходным кодом. Включает в себя JavaScript трекер для сайта; сервис получения, обогащения, сохранения и стриминга данных; сервисы гео-кодинга и определения типа клиентского устройства; систему развертывания нового сервера. 

![Alcolytics sheme](https://raw.githubusercontent.com/alcolytics/alco-tracker/master/docs/alco-scheme.png)

## AlcoJS library

JavaScript tracking library for web applications. Lets track custom user actions with arbitrary properties. It automatically tracks page views, user activity (browser events from keyboard, focus, mouse, touch), page scroll, interactions with forms and clicks by links. All data is sent to the server-side collector. Comes as a part of Alcolytics platform.

JavaScript библиотека для отслеживания web приложений и передачи  результатов на сервер. События могут сопровождаться произвольным набором параметров. Автоматически отслеживаются: загрузки страниц, активность, скролл, взаимодействия с формами, клики, а также информация об браузере. Является частью платформы Alcolytics.

## С чего начать

Ознакомьтесь с вводной информацией по отслеживанию событий https://alco.readme.io/docs/web-tracking, затем с api AlcoJS https://alco.readme.io/docs/js-ap

### Особенности связанные с localStorage

Используется осознанно т.к. обработка сессий происходит в барузере и если все необходимые данные положить в куки, 
то ничего приятного не будет, да и смысл тоскать каждый раз туда-сюда эти данные.

Но есть проблемы связанные с localStorage:

- www.вашсайт и вашсайт это разные сайты для localStorage, соотно-не данные будут битые.
- http://вашсайт и https://вашсайт это опять же разные сайты для localStorage и данные не будут связаны

Жесть скажете вы? А вот и нет! Это совершенно нормальная практика редиректить с www на не-www (или наоборот, на любителя),
чтобы не было двух дублей сайта. Что касается http и https, давно уже пора всем пересесть на https, особенно учитывая,
что сертификаты давно бесплатные. 
Скрипт принципиально откажется работать на http (без s) и ругнется в консоли.

## Thanks for open source support

- [BrowserStack](https://www.browserstack.com): great tool for manual and automated testing in browser
- [ReadMe](https://readme.io): beautiful tool for product and api documentation


## License

This software is licensed under the MIT license. See [License File](LICENSE.txt) for more information.

