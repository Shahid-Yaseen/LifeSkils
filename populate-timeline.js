#!/usr/bin/env node

import { db } from './server/db.ts';
import { timelineEvents } from './shared/schema.ts';

const timelineData = [
  // Parliament Evolution
  {
    year: 1066,
    title: "Norman Conquest",
    description: "William the Conqueror establishes Norman rule",
    details: "The Norman Conquest fundamentally changed English governance, introducing feudalism and Norman administrative practices that would influence parliamentary development.",
    category: "conquest",
    importance: 5,
    keyFigures: "William the Conqueror, King Harold II",
    timelineTopic: "parliament",
    eventImage: "https://images.unsplash.com/photo-1594736797933-d0c1d06854d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Medieval castle representing Norman architecture introduced after 1066"
  },
  {
    year: 1215,
    title: "Magna Carta",
    description: "King John signs the Magna Carta, limiting royal power",
    details: "This foundational document established that even the king was subject to law, creating principles that would later influence parliamentary sovereignty.",
    category: "constitutional",
    importance: 5,
    keyFigures: "King John, Stephen Langton, Baron rebels",
    timelineTopic: "parliament",
    eventImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Ancient manuscript representing the Magna Carta document"
  },
  {
    year: 1265,
    title: "First Parliament",
    description: "Simon de Montfort calls the first elected parliament",
    details: "This was the first time commoners were included in a parliamentary assembly, setting a precedent for representative government.",
    category: "parliamentary",
    importance: 5,
    keyFigures: "Simon de Montfort, Henry III",
    timelineTopic: "parliament",
    eventImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Historic parliament building representing early democratic institutions"
  },
  {
    year: 1295,
    title: "Model Parliament",
    description: "Edward I establishes the Model Parliament",
    details: "This parliament included representatives from all social classes and became the template for future parliamentary assemblies.",
    category: "parliamentary",
    importance: 4,
    keyFigures: "Edward I",
    timelineTopic: "parliament",
    eventImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Royal court session representing medieval governance"
  },
  {
    year: 1341,
    title: "Commons Separation",
    description: "House of Commons separates from House of Lords",
    details: "This separation created the bicameral system that continues to this day, with distinct roles for each house.",
    category: "parliamentary",
    importance: 4,
    keyFigures: "Edward III",
    timelineTopic: "parliament",
    eventImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Parliamentary chamber representing the separation of houses"
  },
  {
    year: 1642,
    title: "English Civil War Begins",
    description: "Conflict between Parliament and Crown begins",
    details: "This war was fundamentally about the balance of power between Parliament and the monarchy, leading to the temporary abolition of the monarchy.",
    category: "conflict",
    importance: 5,
    keyFigures: "Charles I, Oliver Cromwell, John Pym",
    timelineTopic: "parliament",
    eventImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Civil war battlefield representing the conflict between Parliament and Crown"
  },
  {
    year: 1649,
    title: "Execution of Charles I",
    description: "King Charles I is executed by Parliament",
    details: "This unprecedented act demonstrated Parliament's ultimate authority and led to the establishment of the Commonwealth.",
    category: "revolutionary",
    importance: 5,
    keyFigures: "Charles I, Oliver Cromwell",
    timelineTopic: "parliament",
    eventImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Historic execution scene representing the end of absolute monarchy"
  },
  {
    year: 1688,
    title: "Glorious Revolution",
    description: "William and Mary invited to rule with parliamentary consent",
    details: "This bloodless revolution established the principle that monarchs rule by parliamentary consent, not divine right.",
    category: "revolutionary",
    importance: 5,
    keyFigures: "William III, Mary II, James II",
    timelineTopic: "parliament",
    eventImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Royal coronation representing the peaceful transfer of power"
  },
  {
    year: 1689,
    title: "Bill of Rights",
    description: "Parliament passes the Bill of Rights",
    details: "This document established parliamentary supremacy and limited royal power, becoming a foundation of British constitutional law.",
    category: "constitutional",
    importance: 5,
    keyFigures: "William III, Mary II",
    timelineTopic: "parliament",
    eventImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Historic document representing the Bill of Rights"
  },
  {
    year: 1707,
    title: "Act of Union",
    description: "England and Scotland unite under one Parliament",
    details: "This created the Kingdom of Great Britain with a single Parliament at Westminster, while preserving Scottish legal and educational systems.",
    category: "constitutional",
    importance: 4,
    keyFigures: "Anne, Queen of Great Britain",
    timelineTopic: "parliament",
    eventImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Union flag representing the unification of England and Scotland"
  },
  {
    year: 1801,
    title: "Act of Union with Ireland",
    description: "Ireland joins the United Kingdom",
    details: "This created the United Kingdom of Great Britain and Ireland, though it would later be partially reversed with Irish independence.",
    category: "constitutional",
    importance: 4,
    keyFigures: "George III",
    timelineTopic: "parliament",
    eventImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "United Kingdom flag representing the union with Ireland"
  },
  {
    year: 1832,
    title: "Great Reform Act",
    description: "Major expansion of voting rights and parliamentary representation",
    details: "This act extended voting rights to more men and reformed rotten boroughs, making Parliament more representative.",
    category: "reform",
    importance: 4,
    keyFigures: "Earl Grey, William IV",
    timelineTopic: "parliament",
    eventImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Voting scene representing expanded democratic participation"
  },
  {
    year: 1911,
    title: "Parliament Act",
    description: "House of Lords' veto power is limited",
    details: "This act reduced the House of Lords' power to delay legislation, establishing the supremacy of the House of Commons.",
    category: "constitutional",
    importance: 4,
    keyFigures: "Herbert Asquith, David Lloyd George",
    timelineTopic: "parliament",
    eventImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Parliament building representing the constitutional changes"
  },
  {
    year: 1999,
    title: "House of Lords Reform",
    description: "Hereditary peers mostly removed from House of Lords",
    details: "This reform modernized the House of Lords by removing most hereditary peers, making it more democratic.",
    category: "reform",
    importance: 3,
    keyFigures: "Tony Blair",
    timelineTopic: "parliament",
    eventImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Modern parliament building representing ongoing reform"
  },
  {
    year: 2016,
    title: "EU Referendum",
    description: "UK votes to leave the European Union",
    details: "This referendum result led to Brexit and significant changes in UK-EU relations, demonstrating direct democracy in action.",
    category: "referendum",
    importance: 4,
    keyFigures: "David Cameron, Boris Johnson",
    timelineTopic: "parliament",
    eventImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Voting booth representing democratic participation"
  },

  // Key Documents
  {
    year: 1215,
    title: "Magna Carta",
    description: "Foundation of constitutional law and individual rights",
    details: "The Magna Carta established that everyone, including the king, is subject to law. It influenced constitutional development worldwide.",
    category: "document",
    importance: 5,
    keyFigures: "King John, Stephen Langton",
    timelineTopic: "documents",
    eventImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Ancient manuscript representing the Magna Carta"
  },
  {
    year: 1689,
    title: "Bill of Rights",
    description: "Establishes parliamentary supremacy and individual liberties",
    details: "This document limited royal power and established fundamental rights that influenced constitutional law globally.",
    category: "document",
    importance: 5,
    keyFigures: "William III, Mary II",
    timelineTopic: "documents",
    eventImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Historic document representing the Bill of Rights"
  },
  {
    year: 1701,
    title: "Act of Settlement",
    description: "Establishes Protestant succession and judicial independence",
    details: "This act ensured Protestant succession to the throne and established the independence of judges from royal control.",
    category: "document",
    importance: 4,
    keyFigures: "William III",
    timelineTopic: "documents",
    eventImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Royal document representing the Act of Settlement"
  },
  {
    year: 1918,
    title: "Representation of the People Act",
    description: "Extends voting rights to most men and some women",
    details: "This act significantly expanded democracy by giving most men and women over 30 the right to vote.",
    category: "document",
    importance: 4,
    keyFigures: "David Lloyd George",
    timelineTopic: "documents",
    eventImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Voting rights document representing expanded democracy"
  },
  {
    year: 1928,
    title: "Equal Franchise Act",
    description: "Gives women equal voting rights with men",
    details: "This act finally gave women the same voting rights as men, completing the journey to universal suffrage.",
    category: "document",
    importance: 4,
    keyFigures: "Stanley Baldwin",
    timelineTopic: "documents",
    eventImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Suffrage document representing women's voting rights"
  },
  {
    year: 1998,
    title: "Human Rights Act",
    description: "Incorporates European Convention on Human Rights into UK law",
    details: "This act made human rights directly enforceable in UK courts, strengthening individual rights protection.",
    category: "document",
    importance: 4,
    keyFigures: "Tony Blair",
    timelineTopic: "documents",
    eventImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Human rights document representing individual liberties"
  },

  // Voting Rights Evolution
  {
    year: 1432,
    title: "Property Qualification for Voting",
    description: "Voting restricted to property owners",
    details: "Early voting rights were limited to men who owned property worth a certain amount, excluding most of the population.",
    category: "voting",
    importance: 3,
    keyFigures: "Henry VI",
    timelineTopic: "voting_rights",
    eventImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Property deed representing early voting qualifications"
  },
  {
    year: 1832,
    title: "Great Reform Act",
    description: "Expands voting rights to more property owners",
    details: "This act extended voting rights to more men and reformed electoral districts, though still excluding most working-class men.",
    category: "voting",
    importance: 4,
    keyFigures: "Earl Grey",
    timelineTopic: "voting_rights",
    eventImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Voting scene representing expanded suffrage"
  },
  {
    year: 1867,
    title: "Second Reform Act",
    description: "Extends voting rights to urban working-class men",
    details: "This act gave voting rights to many working-class men in towns, significantly expanding the electorate.",
    category: "voting",
    importance: 4,
    keyFigures: "Benjamin Disraeli",
    timelineTopic: "voting_rights",
    eventImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Working-class voters representing expanded suffrage"
  },
  {
    year: 1884,
    title: "Third Reform Act",
    description: "Extends voting rights to rural working-class men",
    details: "This act extended voting rights to working-class men in rural areas, creating a more uniform franchise.",
    category: "voting",
    importance: 4,
    keyFigures: "William Gladstone",
    timelineTopic: "voting_rights",
    eventImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Rural voters representing expanded suffrage"
  },
  {
    year: 1918,
    title: "Representation of the People Act",
    description: "Gives most men and some women the vote",
    details: "This act gave voting rights to most men over 21 and women over 30, dramatically expanding democracy.",
    category: "voting",
    importance: 5,
    keyFigures: "David Lloyd George",
    timelineTopic: "voting_rights",
    eventImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Universal suffrage scene representing expanded voting rights"
  },
  {
    year: 1928,
    title: "Equal Franchise Act",
    description: "Gives women equal voting rights with men",
    details: "This act finally gave women the same voting rights as men, achieving universal adult suffrage.",
    category: "voting",
    importance: 5,
    keyFigures: "Stanley Baldwin",
    timelineTopic: "voting_rights",
    eventImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Women voters representing equal suffrage"
  },
  {
    year: 1969,
    title: "Voting Age Lowered to 18",
    description: "Voting age reduced from 21 to 18",
    details: "This change gave younger adults the right to vote, reflecting changing social attitudes about adulthood.",
    category: "voting",
    importance: 3,
    keyFigures: "Harold Wilson",
    timelineTopic: "voting_rights",
    eventImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Young voters representing lowered voting age"
  },

  // UK Territories and Nations
  {
    year: 43,
    title: "Roman Invasion of Britain",
    description: "Romans establish control over southern Britain",
    details: "The Roman invasion brought new governance structures, roads, and administrative systems that influenced later British institutions.",
    category: "invasion",
    importance: 4,
    keyFigures: "Emperor Claudius, Aulus Plautius",
    timelineTopic: "territories",
    eventImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Roman ruins representing the Roman period in Britain"
  },
  {
    year: 410,
    title: "Roman Withdrawal from Britain",
    description: "Romans leave Britain, beginning the Anglo-Saxon period",
    details: "The Roman withdrawal led to the development of independent Anglo-Saxon kingdoms that would eventually unite to form England.",
    category: "withdrawal",
    importance: 4,
    keyFigures: "Emperor Honorius",
    timelineTopic: "territories",
    eventImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Anglo-Saxon settlement representing the post-Roman period"
  },
  {
    year: 927,
    title: "Kingdom of England Established",
    description: "Athelstan becomes first king of all England",
    details: "This marked the unification of the Anglo-Saxon kingdoms into a single English kingdom.",
    category: "unification",
    importance: 4,
    keyFigures: "Athelstan",
    timelineTopic: "territories",
    eventImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Anglo-Saxon crown representing the unified English kingdom"
  },
  {
    year: 1284,
    title: "Conquest of Wales",
    description: "Edward I completes the conquest of Wales",
    details: "Wales was brought under English control, though it maintained its own legal and cultural identity.",
    category: "conquest",
    importance: 3,
    keyFigures: "Edward I, Llywelyn ap Gruffudd",
    timelineTopic: "territories",
    eventImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Welsh castle representing the conquest of Wales"
  },
  {
    year: 1707,
    title: "Act of Union with Scotland",
    description: "England and Scotland unite to form Great Britain",
    details: "This created the Kingdom of Great Britain with a single Parliament while preserving Scottish institutions.",
    category: "union",
    importance: 4,
    keyFigures: "Anne, Queen of Great Britain",
    timelineTopic: "territories",
    eventImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Union flag representing the union of England and Scotland"
  },
  {
    year: 1801,
    title: "Act of Union with Ireland",
    description: "Ireland joins the United Kingdom",
    details: "This created the United Kingdom of Great Britain and Ireland, though it would later be partially reversed.",
    category: "union",
    importance: 4,
    keyFigures: "George III",
    timelineTopic: "territories",
    eventImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "United Kingdom flag representing the union with Ireland"
  },
  {
    year: 1922,
    title: "Irish Free State Established",
    description: "Most of Ireland gains independence from the UK",
    details: "The Irish Free State was established, though Northern Ireland remained part of the UK.",
    category: "independence",
    importance: 4,
    keyFigures: "Michael Collins, Éamon de Valera",
    timelineTopic: "territories",
    eventImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Irish independence ceremony representing the establishment of the Irish Free State"
  },
  {
    year: 1997,
    title: "Devolution to Scotland and Wales",
    description: "Scotland and Wales gain their own parliaments",
    details: "This devolution gave Scotland and Wales their own legislative bodies while remaining part of the UK.",
    category: "devolution",
    importance: 4,
    keyFigures: "Tony Blair",
    timelineTopic: "territories",
    eventImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Scottish Parliament building representing devolution"
  },
  {
    year: 1998,
    title: "Good Friday Agreement",
    description: "Peace agreement for Northern Ireland",
    details: "This agreement established power-sharing in Northern Ireland and helped end decades of conflict.",
    category: "agreement",
    importance: 4,
    keyFigures: "Tony Blair, Bertie Ahern",
    timelineTopic: "territories",
    imageDescription: "Peace agreement signing representing the Good Friday Agreement"
  },

  // Trade and Economy
  {
    year: 1066,
    title: "Norman Trade Networks",
    description: "Norman conquest establishes new trade connections",
    details: "The Norman conquest brought England into closer contact with continental Europe, expanding trade networks.",
    category: "trade",
    importance: 3,
    keyFigures: "William the Conqueror",
    timelineTopic: "trades",
    eventImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Medieval trade scene representing Norman trade networks"
  },
  {
    year: 1348,
    title: "Black Death",
    description: "Plague devastates England's population and economy",
    details: "The Black Death killed about one-third of England's population, leading to economic and social changes.",
    category: "pandemic",
    importance: 4,
    keyFigures: "Edward III",
    timelineTopic: "trades",
    eventImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Medieval plague scene representing the Black Death"
  },
  {
    year: 1555,
    title: "Muscovy Company Founded",
    description: "First joint-stock company established for trade with Russia",
    details: "This company pioneered new trade routes to Russia and established the joint-stock company model.",
    category: "trade",
    importance: 3,
    keyFigures: "Sebastian Cabot",
    timelineTopic: "trades",
    eventImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Trading ship representing early trade companies"
  },
  {
    year: 1600,
    title: "East India Company Founded",
    description: "Company established for trade with Asia",
    details: "The East India Company became one of the most powerful trading companies in history, eventually ruling large parts of India.",
    category: "trade",
    importance: 4,
    keyFigures: "Elizabeth I",
    timelineTopic: "trades",
    eventImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Trading ship representing the East India Company"
  },
  {
    year: 1651,
    title: "Navigation Acts",
    description: "Laws to protect English shipping and trade",
    details: "These acts required that goods be carried in English ships, protecting English merchants and building naval power.",
    category: "trade",
    importance: 3,
    keyFigures: "Oliver Cromwell",
    timelineTopic: "trades",
    eventImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Trading ship representing the Navigation Acts"
  },
  {
    year: 1707,
    title: "Union Creates Larger Market",
    description: "Union with Scotland creates larger internal market",
    details: "The Act of Union created a larger internal market, boosting trade and economic growth.",
    category: "trade",
    importance: 3,
    keyFigures: "Anne, Queen of Great Britain",
    timelineTopic: "trades",
    eventImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Market scene representing the larger internal market"
  },
  {
    year: 1760,
    title: "Industrial Revolution Begins",
    description: "Transformation from agricultural to industrial economy",
    details: "The Industrial Revolution transformed Britain into the world's first industrial nation, changing society and economy.",
    category: "industrial",
    importance: 5,
    keyFigures: "James Watt, Richard Arkwright",
    timelineTopic: "trades",
    eventImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Industrial factory representing the Industrial Revolution"
  },
  {
    year: 1846,
    title: "Repeal of Corn Laws",
    description: "Free trade in grain established",
    details: "The repeal of the Corn Laws marked a shift toward free trade and helped feed the growing industrial population.",
    category: "trade",
    importance: 4,
    keyFigures: "Robert Peel",
    timelineTopic: "trades",
    eventImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Grain market representing the repeal of Corn Laws"
  },
  {
    year: 1973,
    title: "UK Joins European Economic Community",
    description: "UK becomes member of what becomes the EU",
    details: "UK membership of the EEC created new trade opportunities and obligations within Europe.",
    category: "trade",
    importance: 4,
    keyFigures: "Edward Heath",
    timelineTopic: "trades",
    eventImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "European flag representing UK membership of the EEC"
  },
  {
    year: 2020,
    title: "UK Leaves European Union",
    description: "Brexit completed, new trade relationships established",
    details: "The UK's departure from the EU created new trade arrangements and challenges for British businesses.",
    category: "trade",
    importance: 4,
    keyFigures: "Boris Johnson",
    timelineTopic: "trades",
    eventImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=450",
    imageDescription: "Brexit scene representing the UK's departure from the EU"
  }
];

async function populateTimeline() {
  try {
    console.log('Starting timeline population...');
    
    // Clear existing timeline events
    console.log('Clearing existing timeline events...');
    await db.delete(timelineEvents);
    
    // Insert new timeline events
    console.log(`Inserting ${timelineData.length} timeline events...`);
    await db.insert(timelineEvents).values(timelineData);
    
    console.log('✅ Timeline population completed successfully!');
    console.log(`📊 Inserted ${timelineData.length} timeline events`);
    
    // Verify the data
    const count = await db.select().from(timelineEvents);
    console.log(`✅ Verification: ${count.length} events in database`);
    
  } catch (error) {
    console.error('❌ Error populating timeline:', error);
    process.exit(1);
  }
}

populateTimeline();
