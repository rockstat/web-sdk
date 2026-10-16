export const games = [
  {
    slug: 'the-witcher-3',
    title: 'The Witcher 3: Wild Hunt',
    emoji: '🐺',
    gradient: 'linear-gradient(135deg, #4b1d1d, #1a1a2e)',
    year: 2015,
    genre: 'Action RPG',
    developer: 'CD Projekt RED',
    rating: 9.7,
    description:
      'Геральт из Ривии отправляется на поиски Цири в огромном открытом мире. ' +
      'Одна из самых титулованных RPG в истории с сотнями часов контента и двумя ' +
      'великолепными дополнениями.',
  },
  {
    slug: 'elden-ring',
    title: 'Elden Ring',
    emoji: '💍',
    gradient: 'linear-gradient(135deg, #b8860b, #2f2f1e)',
    year: 2022,
    genre: 'Action RPG / Soulslike',
    developer: 'FromSoftware',
    rating: 9.6,
    description:
      'Совместное творение Хидетаки Миядзаки и Джорджа Мартина. Междуземье ждёт ' +
      'Погасшего: открытый мир, беспощадные боссы и фирменная боевая система FromSoftware.',
  },
  {
    slug: 'gta-v',
    title: 'Grand Theft Auto V',
    emoji: '🚗',
    gradient: 'linear-gradient(135deg, #0f3d0f, #1e2a3a)',
    year: 2013,
    genre: 'Action / Open World',
    developer: 'Rockstar Games',
    rating: 9.5,
    description:
      'Три протагониста, Лос-Сантос и бесконечный онлайн. Одна из самых продаваемых ' +
      'игр всех времён, пережившая три поколения консолей.',
  },
  {
    slug: 'baldurs-gate-3',
    title: "Baldur's Gate 3",
    emoji: '🎲',
    gradient: 'linear-gradient(135deg, #4a1942, #1a1a2e)',
    year: 2023,
    genre: 'cRPG',
    developer: 'Larian Studios',
    rating: 9.8,
    description:
      'Эталонная партийная RPG по правилам D&D. Свобода решений, глубокие персонажи ' +
      'и пошаговые бои — игра года 2023 практически по всем версиям.',
  },
  {
    slug: 'red-dead-redemption-2',
    title: 'Red Dead Redemption 2',
    emoji: '🤠',
    gradient: 'linear-gradient(135deg, #7a2e1d, #2e1a1a)',
    year: 2018,
    genre: 'Action / Adventure',
    developer: 'Rockstar Games',
    rating: 9.7,
    description:
      'Закат эпохи Дикого Запада глазами Артура Моргана. Самый детализированный ' +
      'открытый мир Rockstar и одна из лучших историй в играх.',
  },
  {
    slug: 'cyberpunk-2077',
    title: 'Cyberpunk 2077',
    emoji: '🌆',
    gradient: 'linear-gradient(135deg, #8a7500, #1a2e2e)',
    year: 2020,
    genre: 'Action RPG',
    developer: 'CD Projekt RED',
    rating: 9.0,
    description:
      'Найт-Сити, Киану Ривз и чип бессмертия. После непростого старта игра ' +
      'преобразилась: патчи и дополнение Phantom Liberty сделали её образцовой.',
  },
  {
    slug: 'minecraft',
    title: 'Minecraft',
    emoji: '⛏️',
    gradient: 'linear-gradient(135deg, #2d5a27, #3e2723)',
    year: 2011,
    genre: 'Sandbox / Survival',
    developer: 'Mojang Studios',
    rating: 9.3,
    description:
      'Самая продаваемая игра в истории. Кубический мир без границ: выживание, ' +
      'строительство, редстоун-инженерия и бесконечные моды.',
  },
  {
    slug: 'hades',
    title: 'Hades',
    emoji: '🔥',
    gradient: 'linear-gradient(135deg, #7a1d1d, #2e1a2e)',
    year: 2020,
    genre: 'Roguelike / Action',
    developer: 'Supergiant Games',
    rating: 9.4,
    description:
      'Загрей раз за разом сбегает из царства мёртвых. Идеальный баланс роглайка, ' +
      'сюжета и стиля — каждая смерть двигает историю вперёд.',
  },
  {
    slug: 'hollow-knight',
    title: 'Hollow Knight',
    emoji: '🪲',
    gradient: 'linear-gradient(135deg, #1d3557, #1a1a2e)',
    year: 2017,
    genre: 'Metroidvania',
    developer: 'Team Cherry',
    rating: 9.2,
    description:
      'Павшее королевство Халлоунест, нарисованное вручную. Огромный взаимосвязанный ' +
      'мир, сложные боссы и меланхоличная атмосфера.',
  },
  {
    slug: 'portal-2',
    title: 'Portal 2',
    emoji: '🌀',
    gradient: 'linear-gradient(135deg, #145374, #2e2e1a)',
    year: 2011,
    genre: 'Puzzle',
    developer: 'Valve',
    rating: 9.5,
    description:
      'GLaDOS, Уитли и портальная пушка. Лучшая головоломка своего поколения ' +
      'с образцовым юмором и кооперативом.',
  },
];

export const getGame = (slug) => games.find((g) => g.slug === slug);
