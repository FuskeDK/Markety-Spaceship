// i18n translation strings for the client dashboard (src/pages/Dashboard.tsx).
// Supports English ("en") and Danish ("da"). The `t()` function picks strings
// from the correct dict based on the client's `language` field stored in
// Supabase. `getLocale()` returns the BCP 47 locale string for date formatting.
// Only the dashboard is translated — the admin panel is English-only.
type Dict = {
  dashboardNotFound: string; dashboardNotFoundSub: string;
  claimSubtitle: string; claimPassword: string; claimConfirm: string;
  claimButton: string; claimLoading: string; claimErrorMin: string; claimErrorMatch: string;
  loginSubtitle: string; loginPassword: string; loginButton: string;
  loginLoading: string; loginError: string; forgotPassword: string; somethingWentWrong: string;
  clientSince: string;
  tabOverview: string; tabAnalytics: string; tabInvoices: string; tabCampaigns: string; tabAccount: string;
  overviewTitle: string; overviewSub: string; totalLeads: string; allTime: string;
  thisMonth: string; thisWeek: string; totalInvested: string; perLead: string;
  leadsPerDay: string; allLeads: string; searchLeads: string; exportCsv: string;
  noLeadsYet: string; noLeadsMatch: string;
  colDate: string; colName: string; colEmail: string; colPhone: string; colSource: string;
  analyticsTitle: string; analyticsSub: string; analyticsEmpty: string;
  lastMonth: string; avgPerDay: string; bestDay: string; firstMonth: string;
  previousPeriod: string; last30Days: string; leadsTotal: string;
  notEnoughData: string; vsLastMonth: string;
  monthlyTrend: string; monthlyTrendSub: string;
  bySource: string; bySourceSub: string; byDayOfWeek: string; byDayOfWeekSub: string;
  invoicesTitle: string; invoicesSub: string; totalBilledAllTime: string;
  invoiceCount: string; invoiceCountPlural: string; latestInvoice: string;
  invoiceHistory: string; noInvoicesYet: string;
  colPeriod: string; colLeads: string; colAmount: string; colPay: string;
  payNow: string; invoiceSentBadge: string; invoicePaidBadge: string; invoiceQuestion: string; contactUs: string;
  campaignsTitle: string; campaignsSub: string; campaignName: string;
  campaignActive: string; campaignInactive: string; campaignManagedBy: string;
  leadsThisMonth: string; pacingVsLast: string; lastLead: string;
  today: string; yesterday: string; daysAgo: string; activeChannels: string;
  perfHistory: string; perfHistorySub: string;
  campaignManager: string; campaignManagerText: string; getInTouch: string;
  accountTitle: string; accountSub: string; yourPlan: string;
  labelCompany: string; labelContact: string; labelPricePerLead: string;
  labelClientSince: string; labelCurrency: string;
  changePassword: string; pwUpdated: string;
  currentPassword: string; newPassword: string; confirmNewPassword: string;
  updating: string; updatePassword: string; pwErrorMin: string; pwErrorMatch: string;
  needHelp: string; needHelpText: string;
  refresh: string;
};

const en: Dict = {
  dashboardNotFound: "Dashboard not found",
  dashboardNotFoundSub: "Your link may be incorrect. Contact us at info@marketyleadgen.com",
  claimSubtitle: "Set a password to secure your dashboard.",
  claimPassword: "Choose a password", claimConfirm: "Confirm password",
  claimButton: "Set up my dashboard", claimLoading: "Setting up…",
  claimErrorMin: "Password must be at least 6 characters.",
  claimErrorMatch: "Passwords do not match.",
  loginSubtitle: "Enter your password to continue.",
  loginPassword: "Your password", loginButton: "Sign in", loginLoading: "Signing in…",
  loginError: "Incorrect password.", forgotPassword: "Forgot your password? Contact us at",
  somethingWentWrong: "Something went wrong.",
  clientSince: "Client since {date}",
  tabOverview: "Overview", tabAnalytics: "Analytics", tabInvoices: "Invoices",
  tabCampaigns: "Campaigns", tabAccount: "Account",
  overviewTitle: "Your lead dashboard",
  overviewSub: "Live overview of every lead Markety has delivered for {company}.",
  totalLeads: "Total leads", allTime: "All time", thisMonth: "This month",
  thisWeek: "This week", totalInvested: "Total invested", perLead: "{price} per lead",
  leadsPerDay: "Leads per day", allLeads: "All leads",
  searchLeads: "Search leads…", exportCsv: "Export CSV",
  noLeadsYet: "No leads yet. Your campaigns are being set up.",
  noLeadsMatch: "No leads match \"{search}\".",
  colDate: "Date", colName: "Name", colEmail: "Email", colPhone: "Phone", colSource: "Source",
  analyticsTitle: "Analytics",
  analyticsSub: "Insights into how your leads are coming in.",
  analyticsEmpty: "Analytics will appear once your first leads arrive.",
  lastMonth: "Last month", avgPerDay: "Avg per day", bestDay: "Best day",
  firstMonth: "First month", previousPeriod: "Previous period", last30Days: "Last 30 days",
  leadsTotal: "{n} leads total", notEnoughData: "Not enough data", vsLastMonth: "vs last month",
  monthlyTrend: "Monthly trend",
  monthlyTrendSub: "Leads delivered each month over the last 6 months",
  bySource: "By source", bySourceSub: "Where your leads come from",
  byDayOfWeek: "By day of week", byDayOfWeekSub: "Which days you receive the most leads",
  invoicesTitle: "Invoices", invoicesSub: "Invoices sent by Markety each month.",
  totalBilledAllTime: "Total billed (all time)",
  invoiceCount: "{n} invoice", invoiceCountPlural: "{n} invoices",
  latestInvoice: "Latest invoice", invoiceHistory: "Invoice history",
  noInvoicesYet: "No invoices yet.",
  colPeriod: "Period", colLeads: "Leads", colAmount: "Amount", colPay: "Pay",
  payNow: "Pay now", invoiceSentBadge: "Sent", invoicePaidBadge: "Paid",
  invoiceQuestion: "Questions about an invoice?", contactUs: "Contact us",
  campaignsTitle: "Campaigns",
  campaignsSub: "Status and performance of your active lead generation campaigns.",
  campaignName: "Inbound Lead Generation",
  campaignActive: "Active", campaignInactive: "No recent activity",
  campaignManagedBy: "Managed by Markety · {company}",
  leadsThisMonth: "Leads this month", pacingVsLast: "Pacing vs last month",
  lastLead: "Last lead", today: "Today", yesterday: "Yesterday", daysAgo: "{n}d ago",
  activeChannels: "Active channels",
  perfHistory: "Performance history", perfHistorySub: "Leads delivered per month",
  campaignManager: "Campaign manager",
  campaignManagerText: "Your campaigns are managed by the Markety team. We handle targeting, optimization, and delivery so you can focus on closing leads.",
  getInTouch: "Get in touch",
  accountTitle: "Account", accountSub: "Your plan details and account settings.",
  yourPlan: "Your plan", labelCompany: "Company", labelContact: "Contact",
  labelPricePerLead: "Price per lead", labelClientSince: "Client since", labelCurrency: "Currency",
  changePassword: "Change password", pwUpdated: "Password updated successfully.",
  currentPassword: "Current password", newPassword: "New password",
  confirmNewPassword: "Confirm new password",
  updating: "Updating…", updatePassword: "Update password",
  pwErrorMin: "New password must be at least 6 characters.",
  pwErrorMatch: "Passwords do not match.",
  needHelp: "Need help?",
  needHelpText: "Questions about your campaigns, leads, or invoices? Reach out and we'll get back to you quickly.",
  refresh: "Refresh",
};

const da: Dict = {
  dashboardNotFound: "Dashboard ikke fundet",
  dashboardNotFoundSub: "Dit link er måske forkert. Kontakt os på info@marketyleadgen.com",
  claimSubtitle: "Opret en adgangskode for at sikre dit dashboard.",
  claimPassword: "Vælg en adgangskode", claimConfirm: "Bekræft adgangskode",
  claimButton: "Opsæt mit dashboard", claimLoading: "Opsætter…",
  claimErrorMin: "Adgangskoden skal være mindst 6 tegn.",
  claimErrorMatch: "Adgangskoderne stemmer ikke overens.",
  loginSubtitle: "Indtast din adgangskode for at fortsætte.",
  loginPassword: "Din adgangskode", loginButton: "Log ind", loginLoading: "Logger ind…",
  loginError: "Forkert adgangskode.", forgotPassword: "Glemt din adgangskode? Kontakt os på",
  somethingWentWrong: "Noget gik galt.",
  clientSince: "Kunde siden {date}",
  tabOverview: "Oversigt", tabAnalytics: "Analyse", tabInvoices: "Fakturaer",
  tabCampaigns: "Kampagner", tabAccount: "Konto",
  overviewTitle: "Dit lead-dashboard",
  overviewSub: "Live oversigt over alle leads Markety har leveret til {company}.",
  totalLeads: "Leads i alt", allTime: "Alle tider", thisMonth: "Denne måned",
  thisWeek: "Denne uge", totalInvested: "Samlet investering", perLead: "{price} pr. lead",
  leadsPerDay: "Leads per dag", allLeads: "Alle leads",
  searchLeads: "Søg leads…", exportCsv: "Eksporter CSV",
  noLeadsYet: "Ingen leads endnu. Dine kampagner er ved at blive opsat.",
  noLeadsMatch: "Ingen leads matcher \"{search}\".",
  colDate: "Dato", colName: "Navn", colEmail: "E-mail", colPhone: "Telefon", colSource: "Kilde",
  analyticsTitle: "Analyse",
  analyticsSub: "Indsigt i, hvordan dine leads kommer ind.",
  analyticsEmpty: "Analyse vises, når dine første leads ankommer.",
  lastMonth: "Forrige måned", avgPerDay: "Gns. per dag", bestDay: "Bedste dag",
  firstMonth: "Første måned", previousPeriod: "Forrige periode", last30Days: "De sidste 30 dage",
  leadsTotal: "{n} leads i alt", notEnoughData: "Ikke nok data", vsLastMonth: "vs. forrige måned",
  monthlyTrend: "Månedlig tendens",
  monthlyTrendSub: "Leverede leads pr. måned de seneste 6 måneder",
  bySource: "Pr. kilde", bySourceSub: "Hvor dine leads kommer fra",
  byDayOfWeek: "Pr. ugedag", byDayOfWeekSub: "Hvilke dage du modtager flest leads",
  invoicesTitle: "Fakturaer", invoicesSub: "Fakturaer sendt af Markety hver måned.",
  totalBilledAllTime: "Faktureret i alt (alle tider)",
  invoiceCount: "{n} faktura", invoiceCountPlural: "{n} fakturaer",
  latestInvoice: "Seneste faktura", invoiceHistory: "Fakturahistorik",
  noInvoicesYet: "Ingen fakturaer endnu.",
  colPeriod: "Periode", colLeads: "Leads", colAmount: "Beløb", colPay: "Betal",
  payNow: "Betal nu", invoiceSentBadge: "Sendt", invoicePaidBadge: "Betalt",
  invoiceQuestion: "Spørgsmål til en faktura?", contactUs: "Kontakt os",
  campaignsTitle: "Kampagner",
  campaignsSub: "Status og performance for dine aktive leadgenerationskampagner.",
  campaignName: "Indgående leadgenerering",
  campaignActive: "Aktiv", campaignInactive: "Ingen nylig aktivitet",
  campaignManagedBy: "Administreret af Markety · {company}",
  leadsThisMonth: "Leads denne måned", pacingVsLast: "Pace vs. forrige måned",
  lastLead: "Seneste lead", today: "I dag", yesterday: "I går", daysAgo: "{n} dage siden",
  activeChannels: "Aktive kanaler",
  perfHistory: "Performancehistorik", perfHistorySub: "Leverede leads pr. måned",
  campaignManager: "Kampagneansvarlig",
  campaignManagerText: "Dine kampagner administreres af Markety-teamet. Vi tager os af targeting, optimering og levering, så du kan fokusere på at lukke leads.",
  getInTouch: "Kontakt os",
  accountTitle: "Konto", accountSub: "Dine plandetaljer og kontoindstillinger.",
  yourPlan: "Din plan", labelCompany: "Virksomhed", labelContact: "Kontaktperson",
  labelPricePerLead: "Pris pr. lead", labelClientSince: "Kunde siden", labelCurrency: "Valuta",
  changePassword: "Skift adgangskode", pwUpdated: "Adgangskode opdateret.",
  currentPassword: "Nuværende adgangskode", newPassword: "Ny adgangskode",
  confirmNewPassword: "Bekræft ny adgangskode",
  updating: "Opdaterer…", updatePassword: "Opdater adgangskode",
  pwErrorMin: "Ny adgangskode skal være mindst 6 tegn.",
  pwErrorMatch: "Adgangskoderne stemmer ikke overens.",
  needHelp: "Brug for hjælp?",
  needHelpText: "Spørgsmål om dine kampagner, leads eller fakturaer? Ræk ud, og vi vender tilbage hurtigt.",
  refresh: "Opdater",
};

const de: Dict = {
  dashboardNotFound: "Dashboard nicht gefunden",
  dashboardNotFoundSub: "Ihr Link ist möglicherweise falsch. Kontaktieren Sie uns unter info@marketyleadgen.com",
  claimSubtitle: "Legen Sie ein Passwort fest, um Ihr Dashboard zu sichern.",
  claimPassword: "Passwort wählen", claimConfirm: "Passwort bestätigen",
  claimButton: "Dashboard einrichten", claimLoading: "Wird eingerichtet…",
  claimErrorMin: "Das Passwort muss mindestens 6 Zeichen lang sein.",
  claimErrorMatch: "Die Passwörter stimmen nicht überein.",
  loginSubtitle: "Geben Sie Ihr Passwort ein, um fortzufahren.",
  loginPassword: "Ihr Passwort", loginButton: "Anmelden", loginLoading: "Anmeldung…",
  loginError: "Falsches Passwort.", forgotPassword: "Passwort vergessen? Kontaktieren Sie uns unter",
  somethingWentWrong: "Etwas ist schiefgelaufen.",
  clientSince: "Kunde seit {date}",
  tabOverview: "Übersicht", tabAnalytics: "Analyse", tabInvoices: "Rechnungen",
  tabCampaigns: "Kampagnen", tabAccount: "Konto",
  overviewTitle: "Ihr Lead-Dashboard",
  overviewSub: "Live-Übersicht aller Leads, die Markety für {company} geliefert hat.",
  totalLeads: "Leads gesamt", allTime: "Gesamt", thisMonth: "Diesen Monat",
  thisWeek: "Diese Woche", totalInvested: "Gesamtinvestition", perLead: "{price} pro Lead",
  leadsPerDay: "Leads pro Tag", allLeads: "Alle Leads",
  searchLeads: "Leads suchen…", exportCsv: "CSV exportieren",
  noLeadsYet: "Noch keine Leads. Ihre Kampagnen werden eingerichtet.",
  noLeadsMatch: "Keine Leads stimmen mit \"{search}\" überein.",
  colDate: "Datum", colName: "Name", colEmail: "E-Mail", colPhone: "Telefon", colSource: "Quelle",
  analyticsTitle: "Analyse",
  analyticsSub: "Einblicke in Ihre eingehenden Leads.",
  analyticsEmpty: "Analysen erscheinen, sobald Ihre ersten Leads eintreffen.",
  lastMonth: "Letzter Monat", avgPerDay: "Ø pro Tag", bestDay: "Bester Tag",
  firstMonth: "Erster Monat", previousPeriod: "Vorheriger Zeitraum", last30Days: "Letzte 30 Tage",
  leadsTotal: "{n} Leads gesamt", notEnoughData: "Nicht genug Daten", vsLastMonth: "vs. letzter Monat",
  monthlyTrend: "Monatlicher Trend",
  monthlyTrendSub: "Gelieferte Leads pro Monat in den letzten 6 Monaten",
  bySource: "Nach Quelle", bySourceSub: "Woher Ihre Leads kommen",
  byDayOfWeek: "Nach Wochentag", byDayOfWeekSub: "An welchen Tagen Sie die meisten Leads erhalten",
  invoicesTitle: "Rechnungen", invoicesSub: "Von Markety monatlich versendete Rechnungen.",
  totalBilledAllTime: "Insgesamt in Rechnung gestellt",
  invoiceCount: "{n} Rechnung", invoiceCountPlural: "{n} Rechnungen",
  latestInvoice: "Neueste Rechnung", invoiceHistory: "Rechnungshistorie",
  noInvoicesYet: "Noch keine Rechnungen.",
  colPeriod: "Zeitraum", colLeads: "Leads", colAmount: "Betrag", colPay: "Bezahlen",
  payNow: "Jetzt bezahlen", invoiceSentBadge: "Gesendet", invoicePaidBadge: "Bezahlt",
  invoiceQuestion: "Fragen zu einer Rechnung?", contactUs: "Kontakt",
  campaignsTitle: "Kampagnen",
  campaignsSub: "Status und Performance Ihrer aktiven Lead-Kampagnen.",
  campaignName: "Eingehende Lead-Generierung",
  campaignActive: "Aktiv", campaignInactive: "Keine aktuelle Aktivität",
  campaignManagedBy: "Verwaltet von Markety · {company}",
  leadsThisMonth: "Leads diesen Monat", pacingVsLast: "Tempo vs. letzter Monat",
  lastLead: "Letzter Lead", today: "Heute", yesterday: "Gestern", daysAgo: "Vor {n} Tagen",
  activeChannels: "Aktive Kanäle",
  perfHistory: "Performance-Verlauf", perfHistorySub: "Gelieferte Leads pro Monat",
  campaignManager: "Kampagnenmanager",
  campaignManagerText: "Ihre Kampagnen werden vom Markety-Team verwaltet. Wir kümmern uns um Targeting, Optimierung und Lieferung.",
  getInTouch: "Kontakt aufnehmen",
  accountTitle: "Konto", accountSub: "Ihre Plandetails und Kontoeinstellungen.",
  yourPlan: "Ihr Plan", labelCompany: "Unternehmen", labelContact: "Kontaktperson",
  labelPricePerLead: "Preis pro Lead", labelClientSince: "Kunde seit", labelCurrency: "Währung",
  changePassword: "Passwort ändern", pwUpdated: "Passwort erfolgreich aktualisiert.",
  currentPassword: "Aktuelles Passwort", newPassword: "Neues Passwort",
  confirmNewPassword: "Neues Passwort bestätigen",
  updating: "Aktualisierung…", updatePassword: "Passwort aktualisieren",
  pwErrorMin: "Das neue Passwort muss mindestens 6 Zeichen lang sein.",
  pwErrorMatch: "Die Passwörter stimmen nicht überein.",
  needHelp: "Hilfe benötigt?",
  needHelpText: "Fragen zu Kampagnen, Leads oder Rechnungen? Schreiben Sie uns.",
  refresh: "Aktualisieren",
};

const sv: Dict = {
  dashboardNotFound: "Dashboard hittades inte",
  dashboardNotFoundSub: "Din länk kan vara felaktig. Kontakta oss på info@marketyleadgen.com",
  claimSubtitle: "Ange ett lösenord för att säkra ditt dashboard.",
  claimPassword: "Välj ett lösenord", claimConfirm: "Bekräfta lösenord",
  claimButton: "Konfigurera mitt dashboard", claimLoading: "Konfigurerar…",
  claimErrorMin: "Lösenordet måste vara minst 6 tecken.",
  claimErrorMatch: "Lösenorden matchar inte.",
  loginSubtitle: "Ange ditt lösenord för att fortsätta.",
  loginPassword: "Ditt lösenord", loginButton: "Logga in", loginLoading: "Loggar in…",
  loginError: "Fel lösenord.", forgotPassword: "Glömt ditt lösenord? Kontakta oss på",
  somethingWentWrong: "Något gick fel.",
  clientSince: "Kund sedan {date}",
  tabOverview: "Översikt", tabAnalytics: "Analys", tabInvoices: "Fakturor",
  tabCampaigns: "Kampanjer", tabAccount: "Konto",
  overviewTitle: "Ditt lead-dashboard",
  overviewSub: "Live-översikt över alla leads som Markety har levererat till {company}.",
  totalLeads: "Leads totalt", allTime: "Totalt", thisMonth: "Den här månaden",
  thisWeek: "Den här veckan", totalInvested: "Total investering", perLead: "{price} per lead",
  leadsPerDay: "Leads per dag", allLeads: "Alla leads",
  searchLeads: "Sök leads…", exportCsv: "Exportera CSV",
  noLeadsYet: "Inga leads ännu. Dina kampanjer håller på att sättas upp.",
  noLeadsMatch: "Inga leads matchar \"{search}\".",
  colDate: "Datum", colName: "Namn", colEmail: "E-post", colPhone: "Telefon", colSource: "Källa",
  analyticsTitle: "Analys",
  analyticsSub: "Insikter om hur dina leads kommer in.",
  analyticsEmpty: "Analys visas när dina första leads anländer.",
  lastMonth: "Förra månaden", avgPerDay: "Snitt per dag", bestDay: "Bästa dag",
  firstMonth: "Första månaden", previousPeriod: "Föregående period", last30Days: "Senaste 30 dagarna",
  leadsTotal: "{n} leads totalt", notEnoughData: "Inte tillräckligt med data", vsLastMonth: "vs förra månaden",
  monthlyTrend: "Månatlig trend",
  monthlyTrendSub: "Levererade leads per månad de senaste 6 månaderna",
  bySource: "Per källa", bySourceSub: "Varifrån dina leads kommer",
  byDayOfWeek: "Per veckodag", byDayOfWeekSub: "Vilka dagar du får flest leads",
  invoicesTitle: "Fakturor", invoicesSub: "Fakturor skickade av Markety varje månad.",
  totalBilledAllTime: "Totalt fakturerat",
  invoiceCount: "{n} faktura", invoiceCountPlural: "{n} fakturor",
  latestInvoice: "Senaste faktura", invoiceHistory: "Fakturahistorik",
  noInvoicesYet: "Inga fakturor ännu.",
  colPeriod: "Period", colLeads: "Leads", colAmount: "Belopp", colPay: "Betala",
  payNow: "Betala nu", invoiceSentBadge: "Skickad", invoicePaidBadge: "Betald",
  invoiceQuestion: "Frågor om en faktura?", contactUs: "Kontakta oss",
  campaignsTitle: "Kampanjer",
  campaignsSub: "Status och prestanda för dina aktiva leadkampanjer.",
  campaignName: "Inkommande leadgenerering",
  campaignActive: "Aktiv", campaignInactive: "Ingen nylig aktivitet",
  campaignManagedBy: "Hanteras av Markety · {company}",
  leadsThisMonth: "Leads den här månaden", pacingVsLast: "Tempo vs förra månaden",
  lastLead: "Senaste lead", today: "Idag", yesterday: "Igår", daysAgo: "För {n} dagar sedan",
  activeChannels: "Aktiva kanaler",
  perfHistory: "Prestationshistorik", perfHistorySub: "Levererade leads per månad",
  campaignManager: "Kampanjansvarig",
  campaignManagerText: "Dina kampanjer hanteras av Markety-teamet. Vi sköter targeting, optimering och leverans.",
  getInTouch: "Kontakta oss",
  accountTitle: "Konto", accountSub: "Dina planuppgifter och kontoinställningar.",
  yourPlan: "Din plan", labelCompany: "Företag", labelContact: "Kontaktperson",
  labelPricePerLead: "Pris per lead", labelClientSince: "Kund sedan", labelCurrency: "Valuta",
  changePassword: "Ändra lösenord", pwUpdated: "Lösenordet har uppdaterats.",
  currentPassword: "Nuvarande lösenord", newPassword: "Nytt lösenord",
  confirmNewPassword: "Bekräfta nytt lösenord",
  updating: "Uppdaterar…", updatePassword: "Uppdatera lösenord",
  pwErrorMin: "Det nya lösenordet måste vara minst 6 tecken.",
  pwErrorMatch: "Lösenorden matchar inte.",
  needHelp: "Behöver du hjälp?",
  needHelpText: "Frågor om dina kampanjer, leads eller fakturor? Hör av dig så återkommer vi snabbt.",
  refresh: "Uppdatera",
};

const no: Dict = {
  dashboardNotFound: "Dashboard ikke funnet",
  dashboardNotFoundSub: "Lenken din kan være feil. Kontakt oss på info@marketyleadgen.com",
  claimSubtitle: "Sett et passord for å sikre dashboardet ditt.",
  claimPassword: "Velg et passord", claimConfirm: "Bekreft passord",
  claimButton: "Sett opp mitt dashboard", claimLoading: "Setter opp…",
  claimErrorMin: "Passordet må være minst 6 tegn.",
  claimErrorMatch: "Passordene stemmer ikke overens.",
  loginSubtitle: "Skriv inn passordet ditt for å fortsette.",
  loginPassword: "Ditt passord", loginButton: "Logg inn", loginLoading: "Logger inn…",
  loginError: "Feil passord.", forgotPassword: "Glemt passordet? Kontakt oss på",
  somethingWentWrong: "Noe gikk galt.",
  clientSince: "Kunde siden {date}",
  tabOverview: "Oversikt", tabAnalytics: "Analyse", tabInvoices: "Fakturaer",
  tabCampaigns: "Kampanjer", tabAccount: "Konto",
  overviewTitle: "Ditt lead-dashboard",
  overviewSub: "Live-oversikt over alle leads Markety har levert til {company}.",
  totalLeads: "Leads totalt", allTime: "Totalt", thisMonth: "Denne måneden",
  thisWeek: "Denne uken", totalInvested: "Total investering", perLead: "{price} per lead",
  leadsPerDay: "Leads per dag", allLeads: "Alle leads",
  searchLeads: "Søk leads…", exportCsv: "Eksporter CSV",
  noLeadsYet: "Ingen leads ennå. Kampanjene dine settes opp.",
  noLeadsMatch: "Ingen leads matcher \"{search}\".",
  colDate: "Dato", colName: "Navn", colEmail: "E-post", colPhone: "Telefon", colSource: "Kilde",
  analyticsTitle: "Analyse",
  analyticsSub: "Innsikt i hvordan leadene dine kommer inn.",
  analyticsEmpty: "Analyse vises når dine første leads ankommer.",
  lastMonth: "Forrige måned", avgPerDay: "Snitt per dag", bestDay: "Beste dag",
  firstMonth: "Første måned", previousPeriod: "Forrige periode", last30Days: "Siste 30 dager",
  leadsTotal: "{n} leads totalt", notEnoughData: "Ikke nok data", vsLastMonth: "vs forrige måned",
  monthlyTrend: "Månedlig trend",
  monthlyTrendSub: "Leverte leads per måned de siste 6 månedene",
  bySource: "Per kilde", bySourceSub: "Hvor leadene dine kommer fra",
  byDayOfWeek: "Per ukedag", byDayOfWeekSub: "Hvilke dager du mottar flest leads",
  invoicesTitle: "Fakturaer", invoicesSub: "Fakturaer sendt av Markety hver måned.",
  totalBilledAllTime: "Totalt fakturert",
  invoiceCount: "{n} faktura", invoiceCountPlural: "{n} fakturaer",
  latestInvoice: "Siste faktura", invoiceHistory: "Fakturahistorikk",
  noInvoicesYet: "Ingen fakturaer ennå.",
  colPeriod: "Periode", colLeads: "Leads", colAmount: "Beløp", colPay: "Betal",
  payNow: "Betal nå", invoiceSentBadge: "Sendt", invoicePaidBadge: "Betalt",
  invoiceQuestion: "Spørsmål om en faktura?", contactUs: "Kontakt oss",
  campaignsTitle: "Kampanjer",
  campaignsSub: "Status og ytelse for dine aktive leadkampanjer.",
  campaignName: "Innkommende leadgenerering",
  campaignActive: "Aktiv", campaignInactive: "Ingen nylig aktivitet",
  campaignManagedBy: "Administrert av Markety · {company}",
  leadsThisMonth: "Leads denne måneden", pacingVsLast: "Tempo vs forrige måned",
  lastLead: "Siste lead", today: "I dag", yesterday: "I går", daysAgo: "For {n} dager siden",
  activeChannels: "Aktive kanaler",
  perfHistory: "Ytelseshistorikk", perfHistorySub: "Leverte leads per måned",
  campaignManager: "Kampanjeansvarlig",
  campaignManagerText: "Kampanjene dine administreres av Markety-teamet. Vi håndterer targeting, optimering og levering.",
  getInTouch: "Ta kontakt",
  accountTitle: "Konto", accountSub: "Plandetaljer og kontoinnstillinger.",
  yourPlan: "Din plan", labelCompany: "Bedrift", labelContact: "Kontaktperson",
  labelPricePerLead: "Pris per lead", labelClientSince: "Kunde siden", labelCurrency: "Valuta",
  changePassword: "Endre passord", pwUpdated: "Passordet ble oppdatert.",
  currentPassword: "Nåværende passord", newPassword: "Nytt passord",
  confirmNewPassword: "Bekreft nytt passord",
  updating: "Oppdaterer…", updatePassword: "Oppdater passord",
  pwErrorMin: "Nytt passord må være minst 6 tegn.",
  pwErrorMatch: "Passordene stemmer ikke overens.",
  needHelp: "Trenger du hjelp?",
  needHelpText: "Spørsmål om kampanjene, leads eller fakturaer? Ta kontakt, så svarer vi raskt.",
  refresh: "Oppdater",
};

const LOCALE_MAP: Record<string, string> = {
  en: "en-GB", da: "da-DK", de: "de-DE", sv: "sv-SE", no: "nb-NO",
};

const dicts: Record<string, Dict> = { en, da, de, sv, no };

export type TranslationKey = keyof Dict;

export function t(lang: string, key: TranslationKey, vars?: Record<string, string>): string {
  const dict = dicts[lang] ?? dicts.en;
  let str = dict[key] ?? en[key];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.split(`{${k}}`).join(v);
    }
  }
  return str;
}

export function getLocale(lang: string): string {
  return LOCALE_MAP[lang] ?? "en-GB";
}
