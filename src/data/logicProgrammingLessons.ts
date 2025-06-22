interface Teaching {
  title: string
  institution: string
  period: string
  description: string
  language?: string
  links: Array<{
    text: string
    url: string
  }>
}

const teachings: Teaching[] = [
  {
    title: 'Logic Programming with Prolog - University Course',
    institution: 'Versailles Saint-Quentin-en-Yvelines University',
    period: '2014-2015',
    description: 'Introduction to Prolog programming language and logic programming paradigms.',
    language: 'french',
    links: [
      {
        text: 'Lesson 1: Logic Programming and Prolog',
        url: '/teaching/prolog/lesson1.pdf',
      },
      {
        text: 'Lesson 1: Prolog code examples',
        url: '/teaching/prolog/lesson1.pl',
      },
      {
        text: 'Lesson 2: Logic Programming and Prolog',
        url: '/teaching/prolog/lesson2.pdf',
      },
      {
        text: 'Lesson 2: Prolog code examples',
        url: '/teaching/prolog/lesson2.pl',
      },
    ],
  },
]

export { type Teaching, teachings }
