export interface PlanContent {
  name: string;
  tagline: string;
  badge?: string;
  benefits: string[];
  highlighted?: boolean;
}

export interface ReasonCopy {
  badge: string;
  heading: string;
  description: string;
}

export interface Dictionary {
  meta: { tagline: string; description: string; keywords: string[] };
  header: { login: string; language: string };
  footer: { useCasesLabel: string; product: string; api: string };
  hero: { titleStart: string; titleAccent: string; subtitle: string };
  upload: {
    dropTitle: string;
    dropHint: string;
    selectFile: string;
    formats: { pdf: string; pptx: string; png: string };
    formatHints: { pdf: string; pptx: string; png: string };
    analyzing: string;
    analyzingHint: string;
    readyTitle: string;
    readyHint: string;
    previewLoading: string;
    download: { pdf: string; pptx: string; png: string };
    edit: string;
    editLoading: string;
    another: string;
    errorTitle: string;
    retry: string;
    limitTitle: string;
    limitHint: string;
    limitCta: string;
  };
  errors: {
    unsupportedFormat: string;
    tooLarge: string;
    generic: string;
    network: string;
    editorOpen: string;
    server: string;
  };
  privacy: {
    badges: string[];
    note: string;
    sectionTitle: string;
    sectionIntro: string;
    weDoTitle: string;
    weDo: string[];
    weDontTitle: string;
    weDont: string[];
    footnote: string;
  };
  positioning: {
    eyebrow: string;
    title: string;
    intro: string;
    pillars: { title: string; body: string }[];
    businessTitle: string;
    businessBody: string;
    studentTitle: string;
    studentBody: string;
  };
  steps: { title: string; items: { title: string; description: string }[] };
  useCasesSection: { title: string; intro: string; cardCta: string; fallback: string };
  useCasePage: {
    breadcrumbHome: string;
    detectsTitle: string;
    outputsTitle: string;
    faqTitle: string;
    othersTitle: string;
  };
  faq: { title: string; items: { q: string; a: string }[] };
  editor: {
    title: string;
    sheet: string;
    rows: string;
    download: string;
    close: string;
    searchLabel: string;
    searchPlaceholder: string;
    searchButton: string;
    searchLoading: string;
    searchEmpty: string;
    searchAdded: string;
    xAxis: string;
    yAxis: string;
    axisAuto: string;
    axisNone: string;
    delete: string;
    addNote: string;
    notePlaceholder: string;
    chartTypes: { bar: string; line: string; donut: string };
  };
  plans: {
    reasons: { download: ReasonCopy; account: ReasonCopy; query: ReasonCopy };
    list: PlanContent[];
    cta: string;
    close: string;
  };
}
