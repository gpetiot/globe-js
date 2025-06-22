interface Paper {
  title: string
  authors: string
  language?: string
  links: Array<{
    text: string
    url: string
  }>
}

const papers: Paper[] = [
  {
    title: 'How Testing Helps to Diagnose Proof Failures',
    authors:
      'Guillaume Petiot, Nikolai Kosmatov, Bernard Botella, Alain Giorgetti and Jacques Julliand',
    links: [
      { text: 'PDF (author preview)', url: '/papers/FAC_18.pdf' },
      { text: 'ACM', url: 'https://doi.org/10.1007/s00165-018-0456-4' },
      { text: 'Benchmarking suite', url: 'https://github.com/gpetiot/StaDy' },
    ],
  },
  {
    title: 'Static and Dynamic Verification of Relational Properties on Self-Composed C Code',
    authors:
      'Lionel Blatter, Nikolai Kosmatov, Pascale Le Gall, Virgile Prevosto and Guillaume Petiot',
    links: [
      { text: 'PDF (author preview)', url: '/papers/TAP_18.pdf' },
      { text: 'Springer', url: 'https://doi.org/10.1007/978-3-319-92994-1_3' },
    ],
  },
  {
    title: 'Your Proof Fails? Testing Helps to Find the Reason',
    authors:
      'Guillaume Petiot, Nikolai Kosmatov, Bernard Botella, Alain Giorgetti and Jacques Julliand',
    links: [
      {
        text: 'Best Paper Award',
        url: '/papers/tap2016_best_paper.pdf',
      },
      { text: 'PDF (author preview)', url: '/papers/TAP_16.pdf' },
      { text: 'Springer', url: 'https://doi.org/10.1007/978-3-319-41135-4_8' },
    ],
  },
  {
    title: 'PhD Thesis: Contribution to C Program Verification by Combining Tests and Proofs',
    authors: 'Guillaume Petiot',
    language: 'french',
    links: [
      { text: 'PDF (last revision)', url: '/papers/phd_thesis.pdf' },
      { text: 'Submitted', url: 'http://www.theses.fr/2015BESA2045' },
    ],
  },
  {
    title: 'Sequential Generation of Structured Arrays and Its Deductive Verification',
    authors: 'Richard Genestier, Alain Giorgetti and Guillaume Petiot',
    links: [
      { text: 'PDF (author preview)', url: '/papers/TAP_15.pdf' },
      { text: 'Springer', url: 'https://doi.org/10.1007/978-3-319-21215-9_7' },
    ],
  },
  {
    title: 'Instrumentation of Annotated C Programs for Test Generation',
    authors:
      'Guillaume Petiot, Bernard Botella, Jacques Julliand, Nikolai Kosmatov and Julien Signoles',
    links: [
      { text: 'PDF (author preview)', url: '/papers/SCAM_14.pdf' },
      { text: 'IEEE', url: 'https://doi.org/10.1109/SCAM.2014.19' },
    ],
  },
  {
    title: 'How Test Generation Helps Software Specification and Deductive Verification in Frama-C',
    authors: 'Guillaume Petiot, Nikolai Kosmatov, Alain Giorgetti and Jacques Julliand',
    links: [
      { text: 'PDF (author preview)', url: '/papers/TAP_14.pdf' },
      { text: 'Springer', url: 'https://doi.org/10.1007/978-3-319-09099-3_16' },
    ],
  },
  {
    title: 'An Optimized Memory Monitoring for Runtime Assertion Checking of C Programs',
    authors: 'Nikolai Kosmatov, Guillaume Petiot and Julien Signoles',
    links: [
      { text: 'PDF (author preview)', url: '/papers/RV_13.pdf' },
      { text: 'Springer', url: 'https://doi.org/10.1007/978-3-642-40787-1_10' },
    ],
  },
]

export { type Paper, papers }
