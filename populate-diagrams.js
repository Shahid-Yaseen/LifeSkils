import { db } from './server/db.ts';
import { diagrams, diagramComponents } from './shared/schema.ts';

async function populateDiagrams() {
  try {
    console.log('Starting diagrams population...');

    // Government System Diagram
    const governmentDiagram = await db.insert(diagrams).values({
      title: "UK Government System",
      description: "The United Kingdom operates as a constitutional monarchy with a parliamentary democracy",
      category: "government",
      section: "overview",
      content: {
        structure: "constitutional monarchy",
        keyElements: ["Monarch", "Prime Minister", "Cabinet", "Parliament", "Civil Service"]
      },
      orderIndex: 1,
      isActive: true,
      icon: "Crown",
      color: "purple",
      tags: ["government", "monarchy", "democracy", "parliament"],
      keyPoints: [
        "Constitutional monarchy with parliamentary democracy",
        "Monarch is Head of State, Prime Minister is Head of Government",
        "Parliament consists of House of Commons and House of Lords",
        "Civil Service is politically neutral"
      ],
      relatedTopics: ["parliament", "monarchy", "democracy"]
    }).returning();

    console.log('Created government diagram:', governmentDiagram[0].id);

    // Add components for government diagram
    await db.insert(diagramComponents).values([
      {
        diagramId: governmentDiagram[0].id,
        type: "card",
        title: "The Monarch",
        content: {
          role: "Head of State",
          current: "King Charles III",
          powers: ["Ceremonial", "Symbolic", "Constitutional"]
        },
        orderIndex: 1,
        isActive: true,
        backgroundColor: "bg-purple-100 dark:bg-purple-900/20",
        borderColor: "border-purple-200 dark:border-purple-800",
        textColor: "text-purple-600 dark:text-purple-400"
      },
      {
        diagramId: governmentDiagram[0].id,
        type: "hierarchy",
        title: "Executive Branch",
        content: {
          levels: [
            { name: "Prime Minister", role: "Head of Government" },
            { name: "Cabinet", role: "Senior Ministers" },
            { name: "Civil Service", role: "Government Administration" }
          ]
        },
        orderIndex: 2,
        isActive: true,
        backgroundColor: "bg-blue-50 dark:bg-blue-900/20",
        borderColor: "border-blue-200 dark:border-blue-800",
        textColor: "text-blue-600 dark:text-blue-400"
      },
      {
        diagramId: governmentDiagram[0].id,
        type: "grid",
        title: "Legislative Branch (Parliament)",
        content: {
          houses: [
            {
              name: "House of Commons",
              members: "650 MPs",
              type: "Elected",
              powers: ["Pass legislation", "Control spending", "Form government"]
            },
            {
              name: "House of Lords",
              members: "~800 members",
              type: "Appointed",
              powers: ["Review legislation", "Suggest amendments", "Delay bills"]
            }
          ]
        },
        orderIndex: 3,
        isActive: true,
        backgroundColor: "bg-green-50 dark:bg-green-900/20",
        borderColor: "border-green-200 dark:border-green-800",
        textColor: "text-green-600 dark:text-green-400"
      }
    ]);

    // Justice System Diagram
    const justiceDiagram = await db.insert(diagrams).values({
      title: "UK Justice System",
      description: "The UK has different justice systems in each nation with distinct courts and procedures",
      category: "justice",
      section: "overview",
      content: {
        systems: ["England & Wales", "Scotland", "Northern Ireland"],
        keyFeatures: ["Independent judiciary", "Rule of law", "Fair trials"]
      },
      orderIndex: 2,
      isActive: true,
      icon: "Scale",
      color: "red",
      tags: ["justice", "courts", "law", "legal system"],
      keyPoints: [
        "Three separate legal systems in the UK",
        "Independent judiciary ensures fair trials",
        "Supreme Court is the highest court",
        "Different court hierarchies for criminal and civil cases"
      ],
      relatedTopics: ["government", "parliament", "legal system"]
    }).returning();

    console.log('Created justice diagram:', justiceDiagram[0].id);

    // Add components for justice diagram
    await db.insert(diagramComponents).values([
      {
        diagramId: justiceDiagram[0].id,
        type: "hierarchy",
        title: "Criminal Courts Hierarchy (England & Wales)",
        content: {
          levels: [
            { name: "Supreme Court", description: "Final appeal court" },
            { name: "Court of Appeal (Criminal Division)", description: "Appeals from Crown Court" },
            { name: "Crown Court", description: "Serious criminal cases, jury trials" },
            { name: "Magistrates' Court", description: "Minor criminal cases, preliminary hearings" }
          ]
        },
        orderIndex: 1,
        isActive: true,
        backgroundColor: "bg-red-50 dark:bg-red-900/20",
        borderColor: "border-red-200 dark:border-red-800",
        textColor: "text-red-600 dark:text-red-400"
      },
      {
        diagramId: justiceDiagram[0].id,
        type: "hierarchy",
        title: "Civil Courts Hierarchy (England & Wales)",
        content: {
          levels: [
            { name: "Supreme Court", description: "Final appeal court" },
            { name: "Court of Appeal (Civil Division)", description: "Appeals from High Court and County Court" },
            { name: "High Court", description: "Complex civil cases - Family, Chancery, Queen's Bench" },
            { name: "County Court", description: "Most civil cases, small claims, family matters" }
          ]
        },
        orderIndex: 2,
        isActive: true,
        backgroundColor: "bg-blue-50 dark:bg-blue-900/20",
        borderColor: "border-blue-200 dark:border-blue-800",
        textColor: "text-blue-600 dark:text-blue-400"
      },
      {
        diagramId: justiceDiagram[0].id,
        type: "card",
        title: "Scotland's Unique System",
        content: {
          description: "Scotland has a distinct legal system with different courts and procedures",
          courts: [
            "High Court of Justiciary (criminal)",
            "Court of Session (civil)",
            "Sheriff Courts (most cases)",
            "Justice of the Peace Courts (minor offences)"
          ]
        },
        orderIndex: 3,
        isActive: true,
        backgroundColor: "bg-blue-50 dark:bg-blue-900/20",
        borderColor: "border-blue-200 dark:border-blue-800",
        textColor: "text-blue-600 dark:text-blue-400"
      }
    ]);

    // Parliament Structure Diagram
    const parliamentDiagram = await db.insert(diagrams).values({
      title: "UK Parliament Structure",
      description: "The UK Parliament consists of the House of Commons, House of Lords, and the Monarch",
      category: "parliament",
      section: "overview",
      content: {
        composition: ["House of Commons", "House of Lords", "Monarch"],
        keyFunctions: ["Make laws", "Debate policies", "Hold government accountable"]
      },
      orderIndex: 3,
      isActive: true,
      icon: "Building",
      color: "green",
      tags: ["parliament", "legislation", "democracy", "government"],
      keyPoints: [
        "Bicameral system with two houses",
        "House of Commons is elected, House of Lords is appointed",
        "Legislative process involves both houses",
        "Parliament Act can override Lords' objections"
      ],
      relatedTopics: ["government", "democracy", "legislation"]
    }).returning();

    console.log('Created parliament diagram:', parliamentDiagram[0].id);

    // Add components for parliament diagram
    await db.insert(diagramComponents).values([
      {
        diagramId: parliamentDiagram[0].id,
        type: "card",
        title: "The Crown in Parliament",
        content: {
          description: "Monarch + House of Lords + House of Commons",
          role: "Constitutional principle that all three elements must agree for legislation"
        },
        orderIndex: 1,
        isActive: true,
        backgroundColor: "bg-purple-100 dark:bg-purple-900/20",
        borderColor: "border-purple-200 dark:border-purple-800",
        textColor: "text-purple-600 dark:text-purple-400"
      },
      {
        diagramId: parliamentDiagram[0].id,
        type: "grid",
        title: "House of Commons",
        content: {
          members: "650 elected MPs",
          election: "First Past the Post",
          term: "5 years maximum",
          keyPositions: ["Speaker", "Prime Minister", "Leader of Opposition", "Chief Whips"],
          functions: ["Pass legislation", "Control government spending", "Question ministers", "Represent constituents", "Form government"]
        },
        orderIndex: 2,
        isActive: true,
        backgroundColor: "bg-green-50 dark:bg-green-900/20",
        borderColor: "border-green-200 dark:border-green-800",
        textColor: "text-green-600 dark:text-green-400"
      },
      {
        diagramId: parliamentDiagram[0].id,
        type: "grid",
        title: "House of Lords",
        content: {
          members: "~800 appointed members",
          types: ["Life Peers (majority)", "Hereditary Peers (92)", "Bishops (26)", "Law Lords (retired)"],
          functions: ["Review legislation", "Suggest amendments", "Delay bills (not money bills)", "Committee work", "Specialist expertise"],
          limits: ["Cannot block money bills", "Can delay bills by 1 year", "Parliament Act can override", "Convention limits powers"]
        },
        orderIndex: 3,
        isActive: true,
        backgroundColor: "bg-red-50 dark:bg-red-900/20",
        borderColor: "border-red-200 dark:border-red-800",
        textColor: "text-red-600 dark:text-red-400"
      },
      {
        diagramId: parliamentDiagram[0].id,
        type: "process",
        title: "Legislative Process",
        content: {
          stages: [
            { step: "1st Reading", description: "Bill introduced, title read" },
            { step: "2nd Reading", description: "General debate on principles" },
            { step: "Committee Stage", description: "Detailed examination, amendments" },
            { step: "3rd Reading", description: "Final debate, usually no amendments" }
          ],
          note: "Process repeats in both Houses, then Royal Assent"
        },
        orderIndex: 4,
        isActive: true,
        backgroundColor: "bg-blue-50 dark:bg-blue-900/20",
        borderColor: "border-blue-200 dark:border-blue-800",
        textColor: "text-blue-600 dark:text-blue-400"
      }
    ]);

    console.log('Diagrams population completed successfully!');
    console.log('Created:');
    console.log('- Government System Diagram with 3 components');
    console.log('- Justice System Diagram with 3 components');
    console.log('- Parliament Structure Diagram with 4 components');

  } catch (error) {
    console.error('Error populating diagrams:', error);
  } finally {
    process.exit(0);
  }
}

populateDiagrams();
