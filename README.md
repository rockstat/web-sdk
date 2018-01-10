


Тут будет ридми, а пока вот эта хуета.

Что делает:

- Трекает просмотры страницы
- Трекает кастомные события
- Из этого добра строит сессии
- Собирает данные о браузере
- Сохраняет данные в localStorage
- Сохраняет последние рекламные метки
- Сохраняет последнюю сессию


### Загрузка кода

В папочке snippet есть пример, но надо бы его сюда перенести.

Указывается сервер на котором хостится стата.
id проекта попросту придумывается. 
Если у вас несколько сайтов, будьте так добры придумайте цифровой id, разный для каждого сайта :)

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


## License

The MIT License (MIT)

Copyright (c) 2017-2018 Dmitry Rodin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


