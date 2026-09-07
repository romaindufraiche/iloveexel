import type { Dictionary } from "./types";

export const en: Dictionary = {
  meta: {
    tagline: "Turn your spreadsheet into an analysis report",
    description:
      "Drop in your Excel or CSV file: SheetInsight finds the numbers that matter, picks the right charts and hands you a report ready to present as PDF, PowerPoint or an image. Free, no sign-up.",
    keywords: [
      "analyse Excel file",
      "automatic Excel report",
      "chart from spreadsheet",
      "analyse CSV online",
      "spreadsheet dashboard",
      "PDF report from Excel",
      "data analysis without Excel",
    ],
  },

  header: { login: "Sign in", language: "Language" },

  footer: {
    useCasesLabel: "Use cases",
    product: "a",
    api: "API access",
  },

  hero: {
    titleStart: "Turn your spreadsheet into an",
    titleAccent: "analysis report",
    subtitle:
      "You don't need to be an analyst. Drop in your file — we find what matters and build your report with the right charts, as a PDF, PowerPoint or image.",
  },

  upload: {
    dropTitle: "Drag and drop your spreadsheet here",
    dropHint: "or click to browse your files — .xlsx, .xls, .xlsm, .csv",
    selectFile: "Choose a file",
    formats: { pdf: "PDF", pptx: "PowerPoint", png: "Image" },
    formatHints: { pdf: "Full report", pptx: "Editable slides", png: "Easy to share" },
    analyzing: "Analysing",
    analyzingHint: "Our engine is finding your key numbers and building your charts.",
    readyTitle: "Your report is ready.",
    readyHint: "The download started automatically.",
    previewLoading: "Building the preview…",
    download: { pdf: "Download the PDF", pptx: "Download the PowerPoint", png: "Download the image" },
    edit: "Edit",
    editLoading: "Loading…",
    another: "Analyse another file",
    errorTitle: "Something went wrong",
    retry: "Try again",
    limitTitle: "You've used today's free reports",
    limitHint: "You've reached your free reports for today. Come back tomorrow, or sign in for more volume.",
    limitCta: "See the plans",
  },

  errors: {
    unsupportedFormat: "Unsupported format. Please use an .xlsx, .xls, .xlsm or .csv file.",
    tooLarge: "That file is over the 20 MB limit.",
    generic: "Something went wrong while analysing the file.",
    network: "Couldn't reach the server. Check your connection and try again.",
    editorOpen: "Couldn't open the editor for this file.",
    server: "Couldn't reach the server.",
  },

  privacy: {
    badges: ["File never stored", "Deleted after the report", "No account needed"],
    note: "Your file is only used to compute your charts, then it's deleted. Nothing is kept, nothing is shared.",
    sectionTitle: "Your data stays yours",
    sectionIntro:
      "SheetInsight does one thing: it reshapes your numbers into charts. Your file is read for as long as the calculation takes, then it's gone. It isn't stored anywhere, and its contents are never used for anything but your own report.",
    weDoTitle: "What we do",
    weDo: [
      "Read your file in memory, just long enough to compute the totals and draw the charts",
      "Send you back the report in the format you asked for",
      "Then forget the file: it no longer exists once the report is generated",
    ],
    weDontTitle: "What we don't do",
    weDont: [
      "Save your file to a server or into a database",
      "Keep its contents after the report is generated",
      "Use it to train a model or feed any other analysis",
      "Pass it on, sell it or share it with a third party",
    ],
    footnote:
      "In practice: no database holds your rows, and no file is written to disk. With no account, there's nothing to attach your data to in the first place.",
  },

  positioning: {
    eyebrow: "Built by data analysts",
    title: "For people whose job isn't building charts",
    intro:
      "Being an analyst is mostly about knowing what to look for in a table. We put that judgement into a tool, for professionals who need to lean on their numbers to decide and to convince — without losing half a day to pivot tables.",
    pillars: [
      {
        title: "From raw rows to a number that means something",
        body: "A 3,000-row export becomes a total, a share, a ranking. You no longer have a column to scroll through: you have a figure to announce, and the chart that backs it up.",
      },
      {
        title: "Something to say about your numbers",
        body: "Every chart comes with its reading in plain language: the trend over the period, who comes out on top, where the bulk is concentrated. Enough to hold your ground in a meeting without being an analyst.",
      },
      {
        title: "The interpretation stays yours",
        body: "The tool does the maths and offers a reading, but you're the one who knows your business. Everything stays editable — titles, text, chart type — so the conclusion is yours, not a machine's.",
      },
    ],
    businessTitle: "Made for business…",
    businessBody:
      "Founders, shop owners, freelancers, project managers, non-profits: anyone sitting on exports to make sense of, with no data team to hand them to.",
    studentTitle: "…and useful to students",
    studentBody:
      "Dissertations, internship reports, research projects: honest charts and a correct reading of correlations, with a student rate at -50% on proof of enrolment.",
  },

  steps: {
    title: "How it works",
    items: [
      {
        title: "1. Drop in your file",
        description: "Drag and drop your spreadsheet (.xlsx, .xls, .csv), or pick it from your computer.",
      },
      {
        title: "2. Our engine reads your data",
        description: "We find your key numbers, pick the right charts and interpret the results — with nothing to configure.",
      },
      {
        title: "3. Download your report",
        description: "PDF, editable PowerPoint or a shareable image: you get a clear report with charts and a written summary.",
      },
    ],
  },

  useCasesSection: {
    title: "What kind of file do you have?",
    intro:
      "A sales export, a budget, an inventory and a survey are not read the same way. The engine recognises what your columns actually contain and adapts both the figures and the charts. Pick the case closest to yours to see exactly what it produces.",
    cardCta: "See what it produces →",
    fallback:
      "Your case isn't listed? Drop your file in anyway: the engine adapts to what's inside, not to a predefined template.",
  },

  useCasePage: {
    breadcrumbHome: "Home",
    detectsTitle: "What the engine recognises in this kind of file",
    outputsTitle: "What you get",
    faqTitle: "Frequently asked questions",
    othersTitle: "Other kinds of files",
  },

  faq: {
    title: "Frequently asked questions",
    items: [
      {
        q: "Do I need to know my way around Excel?",
        a: "No — that's the whole point. You drop in your file, our engine works out what your data contains, picks the right charts and writes the interpretation for you.",
      },
      {
        q: "What formats can I upload, and what do I get back?",
        a: "In: .xlsx, .xls, .xlsm and .csv up to 20 MB. Out: PDF, PowerPoint (.pptx, with real editable charts) or a PNG image ready to share.",
      },
      {
        q: "How many reports can I generate for free?",
        a: "Five a day, with no account, including full chart customisation. Need more volume, period-based queries or API access? The Analyst and Expert plans unlock those, with a Student rate at -50% on proof of enrolment.",
      },
      {
        q: "Do you keep my data?",
        a: "Never. Your file is read in memory for as long as it takes to compute the charts, then it's gone: nothing is written to disk, nothing is saved to a database, and its contents are never reused, shared with anyone, or used to train anything. We only reshape your numbers.",
      },
      {
        q: "Who is behind the tool?",
        a: "SheetInsight is built by data analysts, for professionals whose job isn't building charts but who still need to lean on their numbers. It's a GLM product.",
      },
    ],
  },

  editor: {
    title: "Editing",
    sheet: "Sheet",
    rows: "rows",
    download: "Download",
    close: "Close the editor",
    searchLabel: "Not the right chart? Describe what you're looking for",
    searchPlaceholder: 'e.g. "revenue by region for the first half of 2026" (periods = Premium)',
    searchButton: "Generate",
    searchLoading: "Searching…",
    searchEmpty: "No chart matched that request.",
    searchAdded: "Chart added.",
    delete: "Remove",
    addNote: "+ Add a text block",
    notePlaceholder: "Your text here...",
    chartTypes: { bar: "Bars", line: "Line", donut: "Pie" },
  },

  plans: {
    reasons: {
      download: {
        badge: "Account required",
        heading: "Downloading this customised report requires an account",
        description: "You can keep customising your report for free — to download it, sign in.",
      },
      account: {
        badge: "Coming soon",
        heading: "Sign in to go further",
        description: "More volume and API access, whenever you need them.",
      },
      query: {
        badge: "Account required",
        heading: "Querying your data by period requires an account",
        description:
          'Asking for a chart over a specific period ("first half of 2026", "Q3 2024"...) inside a file spanning several years is an Analyst and Expert feature.',
      },
    },
    list: [
      {
        name: "Student",
        tagline: "With a university address",
        badge: "-50%",
        benefits: ["50 reports a day", "Everything in the Analyst plan", "On proof of enrolment"],
      },
      {
        name: "Analyst",
        tagline: "Signed in",
        benefits: ["50 reports a day", "Period-based queries", "Download customised reports"],
        highlighted: true,
      },
      {
        name: "Expert",
        tagline: "Signed in",
        benefits: ["Unlimited reports", "API access", "Everything in the Analyst plan"],
      },
    ],
    cta: "Sign in — coming soon",
    close: "Close",
  },
};
