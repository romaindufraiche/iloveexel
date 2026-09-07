import type { UseCase } from "./types";

export const enUseCases: UseCase[] = [
  {
    key: "sales",
    slug: "sales-file",
    navLabel: "Sales file",
    h1: "Analyse a sales spreadsheet",
    title: "Analyse a sales spreadsheet — automatic report | SheetInsight",
    metaDescription:
      "Drop in your sales export (.xlsx or .csv): SheetInsight totals your revenue, ranks your best products and regions, and charts the trend over time. PDF report in seconds, no sign-up.",
    intro:
      "A sales export almost always holds the same ingredients: a date, an amount, a product, and a region or sales rep. SheetInsight spots them on its own and builds the report you would have assembled by hand — the total for the period, what's pulling revenue up, and how the curve moves month after month.",
    detects: [
      { column: "Amount, Revenue, Price, Total", role: "the main figure, totalled and averaged" },
      { column: "Date, Order date", role: "the time axis, grouped by month for the trend line" },
      { column: "Product, SKU, Category", role: "the ranking of best sellers" },
      { column: "Region, Customer, Rep", role: "how revenue splits across them" },
    ],
    outputs: [
      "Total revenue and the number of rows analysed, shown right at the top of the report",
      "A monthly trend line, with the direction over the period and the peak and trough called out",
      "A ranking of products or regions, with each one's share of the total",
      "A concentration read: how few products actually make up the bulk of revenue",
    ],
    faq: [
      {
        q: "My file covers several years of sales — is that a problem?",
        a: "No. The curve is grouped by month, so it stays readable across several years. You can also ask for a chart over a specific period (the first half of 2026, say) from the editor's search bar.",
      },
      {
        q: "What if my columns aren't named in a standard way?",
        a: "The engine doesn't rely on names alone: it reads what each column actually contains to work out its type. It also finds the header row when the file starts with a title or blank rows, and it excludes total rows automatically.",
      },
    ],
  },
  {
    key: "monthly-revenue",
    slug: "monthly-revenue-report",
    navLabel: "Monthly revenue",
    h1: "Build a monthly revenue report from a spreadsheet",
    title: "Monthly revenue report from Excel — automated | SheetInsight",
    metaDescription:
      "Turn your spreadsheet into a monthly revenue report: period total, trend line, direction and month-on-month comparison. PDF or PowerPoint ready to present.",
    intro:
      "Monthly reporting is the most repetitive spreadsheet job there is: the same pivot tables, the same charts, every month. SheetInsight reads your file and rebuilds that report automatically — with the interpretation written out, not just the curves.",
    detects: [
      { column: "Date, Month, Period", role: "the monthly grouping of the report" },
      { column: "Revenue, Net amount, Billings", role: "the figure tracked month by month" },
      { column: "Entity, Branch, Channel", role: "the comparison between segments over the period" },
    ],
    outputs: [
      "The period total shown prominently, with no table to read",
      "The monthly curve, with the percentage change between the start and end of the period",
      "A written read: trending up, flat or down, with the months worth noticing",
      "A PowerPoint export with native charts you can edit inside your own slides",
    ],
    faq: [
      {
        q: "Can I reuse the report in my company presentation?",
        a: "Yes. The PowerPoint export contains real PowerPoint charts, not images: you can change the colours, adjust the labels and paste them into your usual slide template.",
      },
      {
        q: "Are the figures recalculated, or taken as they are?",
        a: "They're recalculated from your raw rows. Total rows already present in the file are detected and excluded, so the same amount is never counted twice.",
      },
    ],
  },
  {
    key: "budget",
    slug: "budget",
    navLabel: "Budget",
    h1: "Analyse a budget or expense tracker spreadsheet",
    title: "Analyse a budget spreadsheet — breakdown by cost line | SheetInsight",
    metaDescription:
      "Drop in your budget tracker: SheetInsight totals what's been spent, ranks cost lines by weight and shows the breakdown. Clear PDF report, free and account-free.",
    intro:
      "A budget file always answers two questions: how much has been spent in total, and where the money goes. SheetInsight answers both directly, identifying your cost lines and showing which ones actually weigh — instead of leaving you to read a 300-row column.",
    detects: [
      { column: "Amount, Expense, Cost, Budget", role: "the figure totalled and broken down" },
      { column: "Line, Category, Type", role: "how spending splits" },
      { column: "Team, Project, Department", role: "the comparison between teams or projects" },
      { column: "Date", role: "how spending moves over time" },
    ],
    outputs: [
      "Total spend and the number of cost lines, shown at the top of the report",
      "A pie or bar chart of the breakdown, whichever reads better for your data",
      "The cost lines that concentrate the bulk of the budget",
      "Outlier amounts worth double-checking",
    ],
    faq: [
      {
        q: "My amounts have currency symbols and spaces in them — is that a problem?",
        a: "No. The engine strips currency symbols, thousands separators and decimal commas. It also reads negative amounts written in brackets, as accounting exports do.",
      },
      {
        q: "My file has several tabs — which one gets analysed?",
        a: "The one holding the most usable data. Cover sheets, notes and settings tabs are skipped automatically.",
      },
    ],
  },
  {
    key: "csv",
    slug: "csv-file",
    navLabel: "CSV file",
    h1: "Analyse a CSV file online, with no software",
    title: "Analyse a CSV file online — automatic charts | SheetInsight",
    metaDescription:
      "Open and analyse a CSV file straight from your browser: column detection, charts that fit the data, and a downloadable report. Nothing to install, no sign-up.",
    intro:
      "The CSV exports your tools produce (CRM, online store, till system, database) are unreadable as they are. Instead of opening them in Excel and rebuilding everything, drop them here: the file is analysed on the fly and you get a readable report, with nothing to install.",
    detects: [
      { column: "Numeric columns", role: "the figures to total and distribute" },
      { column: "Date columns", role: "changes over time, including dates stored as text" },
      { column: "Repeating text columns", role: "the categories used for rankings" },
      { column: "IDs and references", role: "detected and then excluded, since summing them means nothing" },
    ],
    outputs: [
      "An immediate read of what's inside: row count, recognised columns and key figures",
      "The chart that best fits each question, picked automatically",
      "A ranked table when there are too many distinct values for a readable chart",
      "An export as PDF, PowerPoint or image",
    ],
    faq: [
      {
        q: "Is my file sent anywhere or kept?",
        a: "Your file is analysed on the fly to produce the report, then it isn't kept on our servers. Nothing is stored once the report is generated.",
      },
      {
        q: "How large can the file be?",
        a: "Up to 20 MB, as .csv, .xlsx, .xls or .xlsm.",
      },
    ],
  },
  {
    key: "charts",
    slug: "automatic-charts",
    navLabel: "Automatic charts",
    h1: "Create the right charts automatically from a spreadsheet",
    title: "Create spreadsheet charts automatically — the right type every time | SheetInsight",
    metaDescription:
      "Stop picking your chart type: SheetInsight decides between line, bars, pie, scatter, matrix or table based on what your data actually is — and writes the interpretation.",
    intro:
      "Picking the right chart is the real craft of an analyst: a line for time, bars to compare, a pie only when the shares mean something. SheetInsight applies those rules for you, then writes out what the chart is saying.",
    detects: [
      { column: "Date + figure", role: "a trend line, with the direction calculated" },
      { column: "Category + figure", role: "a ranked bar chart, bucketed into 'Other' past 8 values" },
      { column: "Category alone", role: "a pie chart of the breakdown" },
      { column: "Two correlated figures", role: "a scatter plot with its trend line" },
      { column: "Three figures or more", role: "a correlation matrix" },
      { column: "Many distinct values", role: "a ranked table, more readable than an overcrowded chart" },
    ],
    outputs: [
      "A chart type chosen from the question your data poses, not from a default setting",
      "A written interpretation under each chart: trend, leader, concentration, correlation",
      "The ability to change the type, colours and text afterwards, for free",
      "A search bar for asking for a specific chart in plain language",
    ],
    faq: [
      {
        q: "Can I change the chart if I'd rather have another type?",
        a: "Yes. After generating, the Edit button opens the editor: you can switch a bar chart to a pie or a line, change the colour palette, rewrite the titles and add text. It's free.",
      },
      {
        q: "What if the chart isn't the one I expected?",
        a: "The editor's search bar lets you ask for it in plain language, for example \"total revenue by region\". The engine finds the matching columns in your file and draws the chart you asked for.",
      },
    ],
  },
  {
    key: "hr",
    slug: "hr-data",
    navLabel: "HR data",
    h1: "Analyse an HR spreadsheet: headcount, absence, hiring",
    title: "Analyse HR data in Excel — headcount and absence | SheetInsight",
    metaDescription:
      "Drop in your HR table: headcount by department, absence tracking, hiring analysis. Clear PDF report, no sign-up.",
    intro:
      "HR files are rarely numeric: lots of text columns (department, contract, status) and few amounts. SheetInsight handles that case — when there's nothing meaningful to sum, it switches to breakdowns and cross-tabs instead of showing totals that would say nothing.",
    detects: [
      { column: "Department, Team, Division", role: "how headcount splits" },
      { column: "Contract type, Status", role: "the make-up of the workforce" },
      { column: "Days absent, Tenure, Age", role: "the figures to distribute and average" },
      { column: "Start date, End date", role: "how arrivals and departures move over time" },
    ],
    outputs: [
      "Headcount split by department and by contract type",
      "A cross-tab of two criteria (department × contract type, say) as a matrix",
      "The distribution of numeric values where there are any: tenure, absence",
      "A presentable report, with no pivot table to build",
    ],
    faq: [
      {
        q: "My file is all text, with no numbers. Does it still work?",
        a: "Yes. With no usable numeric column, the report focuses on breakdowns and cross-tabs between categories, which are the analyses that actually make sense for this kind of file.",
      },
      {
        q: "Is personal data protected?",
        a: "The file is analysed for as long as it takes to build the report, then it isn't kept on our servers. Nothing is stored and nothing is reused.",
      },
    ],
  },
  {
    key: "stock",
    slug: "stock-inventory",
    navLabel: "Stock, inventory",
    h1: "Analyse a stock or inventory spreadsheet",
    title: "Analyse a stock spreadsheet — value and turnover | SheetInsight",
    metaDescription:
      "Drop in your inventory: SheetInsight values the total stock, ranks SKUs by weight and flags unusual quantities. Instant report, no sign-up.",
    intro:
      "An inventory file often runs to hundreds of SKUs, which makes it impossible to read as it stands. The useful question isn't \"what's in stock\" but \"where is the money tied up\": SheetInsight ranks your references by value and surfaces the ones that actually weigh.",
    detects: [
      { column: "Quantity, Stock, On hand", role: "volumes, totalled and distributed" },
      { column: "Unit price, Value, Amount", role: "the valuation of the stock" },
      { column: "Reference, Item, SKU", role: "the ranking, as a table when there are many" },
      { column: "Category, Family, Warehouse", role: "the split by product family or by site" },
    ],
    outputs: [
      "Total stock value and the number of references, shown immediately",
      "A ranking of the references tying up the most value",
      "The split by product family or by warehouse",
      "Unusual quantities flagged — often data entry errors or stockouts",
    ],
    faq: [
      {
        q: "I have more than 500 references — won't the chart be unreadable?",
        a: "That's exactly what's handled: past around twenty distinct values, the engine switches to a ranked table rather than an unreadable bar chart, showing each reference's share of the total.",
      },
      {
        q: "Does it compute value if quantity and price are separate columns?",
        a: "The engine analyses each numeric column separately (quantities on one side, amounts on the other). If your file already has a total value column, that's what's used for the valuation.",
      },
    ],
  },
  {
    key: "survey",
    slug: "survey-results",
    navLabel: "Survey",
    h1: "Analyse survey or questionnaire results",
    title: "Analyse survey results from Excel — breakdowns | SheetInsight",
    metaDescription:
      "Export your survey (Google Forms, Microsoft Forms, Typeform) and drop it here: answer breakdowns, cross-tabs between questions and average scores. No sign-up.",
    intro:
      "Survey exports are a particular case: one column per question, almost all text, and hundreds of rows of answers. Summing would mean nothing — what you need are breakdowns and cross-tabs. That's exactly what the engine produces when it recognises this kind of file.",
    detects: [
      { column: "Multiple-choice answers (Yes/No, scales)", role: "breakdowns as a pie or bars" },
      { column: "Scores, Satisfaction, Rating out of 10", role: "averages and the spread of scores" },
      { column: "Profile, Age, Department, City", role: "cross-tabs between profile and answer" },
      { column: "Timestamp, Response date", role: "how responses accumulated over time" },
    ],
    outputs: [
      "The breakdown of answers for each closed question",
      "A cross-tab of two questions as a matrix, to see who answers what",
      "The average score and its distribution where there are scales",
      "A presentable report, with no pivot table involved",
    ],
    faq: [
      {
        q: "My export comes from Google Forms — is that supported?",
        a: "Yes. Export your responses as .xlsx or .csv from Google Forms, Microsoft Forms or Typeform, then drop the file in: the question wording becomes the column names directly.",
      },
      {
        q: "Are free-text answers analysed?",
        a: "Free-text columns, where every answer is unique, are detected as such and left out of the charts: plotting them would mean nothing. The report focuses on closed questions and scores.",
      },
    ],
  },
  {
    key: "marketing",
    slug: "marketing-data",
    navLabel: "Marketing",
    h1: "Analyse your marketing data: campaigns, leads, conversions",
    title: "Analyse marketing data in Excel — campaigns and conversions | SheetInsight",
    metaDescription:
      "Drop in your campaign or lead export: SheetInsight compares your acquisition channels, totals the volumes and charts how conversions move. Report ready to present.",
    intro:
      "Marketing exports (ads, email campaigns, CRM leads) always pose the same question: which channel actually works. The engine compares your channels, works out each one's share and shows whether the trend is rising or falling — without you building the pivot table.",
    detects: [
      { column: "Channel, Source, Campaign, Medium", role: "the comparison between acquisition channels" },
      { column: "Clicks, Impressions, Leads, Conversions", role: "the volumes compared and totalled" },
      { column: "Cost, Budget, CPC", role: "spend, broken down by channel" },
      { column: "Date", role: "how performance moves over time" },
    ],
    outputs: [
      "A ranking of your channels, with each one's share of the total",
      "The trend line for volumes, with the direction calculated over the period",
      "A concentration read: how few channels drive the bulk of results",
      "The correlation between two figures — spend and conversions, for instance",
    ],
    faq: [
      {
        q: "Can I see whether spend actually drives conversions?",
        a: "Yes. When the file holds several numeric columns, the engine computes their correlations and draws a scatter plot with a trend line for the two most closely linked, with the reading written out.",
      },
      {
        q: "Can I isolate a specific period, like a Q2 campaign?",
        a: 'Yes, from the editor\'s search bar, by writing something like "conversions by channel in Q2 2026". Period-based search is part of the Analyst and Expert plans.',
      },
    ],
  },
  {
    key: "accounting",
    slug: "accounting-invoices",
    navLabel: "Accounting",
    h1: "Analyse an accounting export or invoice file",
    title: "Analyse an accounting export in Excel — invoices and receipts | SheetInsight",
    metaDescription:
      "Drop in your invoice export or ledger: total billed, breakdown by customer or account, monthly trend. Clear PDF report, no sign-up.",
    intro:
      "An accounting export is built to be accurate, not readable. SheetInsight pulls out the three figures that actually matter: how much in total, spread across whom, and how it's moving — handling accounting-formatted amounts, bracketed negatives included.",
    detects: [
      { column: "Net, Gross, Debit, Credit", role: "amounts totalled, bracketed negatives included" },
      { column: "Customer, Supplier, Account", role: "the breakdown and the ranking" },
      { column: "Invoice date, Due date", role: "the monthly trend in billings" },
      { column: "Status, Paid / Outstanding", role: "the split between collected and outstanding" },
    ],
    outputs: [
      "Total billed over the period, with no column to sum yourself",
      "A ranking of customers or accounts, with each one's share",
      "The monthly trend, with the direction over the period",
      "Outlier amounts worth checking before closing",
    ],
    faq: [
      {
        q: "My negative amounts are in brackets, as in accounting. Is that handled?",
        a: "Yes. Accounting-formatted amounts — brackets for negatives, currency symbols, thousands separators, decimal commas — are read correctly.",
      },
      {
        q: "My export has subtotal rows — will they skew the figures?",
        a: "No. Total and subtotal rows are detected and excluded from the calculation, so the same amounts aren't counted twice.",
      },
    ],
  },
  {
    key: "student",
    slug: "dissertation-data",
    navLabel: "Dissertation",
    h1: "Analyse data for a dissertation, thesis or student project",
    title: "Analyse dissertation data from Excel — charts ready to insert | SheetInsight",
    metaDescription:
      "Turn your dissertation, thesis or project data into usable charts: breakdowns, correlations, trends, with the interpretation written out. Student rate available.",
    intro:
      "For a dissertation or an internship report, the point isn't pretty charts: it's showing that you read your data correctly. SheetInsight picks the representation that suits each variable and writes out what it shows — leaving you to build the argument, on figures you can actually stand behind.",
    detects: [
      { column: "Quantitative variables", role: "distributions, means and medians" },
      { column: "Qualitative variables", role: "the make-up of your sample" },
      { column: "Two numeric variables", role: "the correlation, as a scatter plot with its trend line" },
      { column: "Three variables or more", role: "a correlation matrix, to spot the links" },
    ],
    outputs: [
      "Charts exportable as an image or PDF, to drop straight into your document",
      "The correlation coefficient translated into plain language, so your write-up avoids misreadings",
      "A description of your sample: counts, breakdowns, outliers",
      "A PowerPoint export with editable charts, handy for the viva",
    ],
    faq: [
      {
        q: "Is there a student rate?",
        a: "Yes — a Student plan at -50% gives 50 reports a day, on proof of enrolment. Everyday use stays free and account-free.",
      },
      {
        q: "Can the output be used in an academic document?",
        a: "Charts export as a high-resolution image or PDF. The written interpretation is your starting point: it's on you to rephrase it and test it against your research question — the tool does the maths, it doesn't write your dissertation.",
      },
    ],
  },
];
