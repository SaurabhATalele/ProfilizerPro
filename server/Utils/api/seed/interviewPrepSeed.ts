import mongoose from "mongoose";
import connectdb from "@/Utils/api/db/connectDB";
import Subject from "@/Utils/api/Models/Subject";
import Chapter from "@/Utils/api/Models/Chapter";
import Page from "@/Utils/api/Models/Page";
import User from "@/Utils/api/Models/Users";
import { slugify } from "@/Utils/api/Controllers/PageController";

// Predefined Interview Prep content seeded on first run (Section 4). Content is
// real and correct, not placeholder text, since it is the first thing a reader
// sees. Idempotent: if any Subject already exists, seeding is skipped.

interface SeedPage {
  title: string;
  icon?: string;
  tags?: string[];
  content: string;
}

interface SeedChapter {
  title: string;
  pages: SeedPage[];
}

interface SeedSubject {
  key: string;
  label: string;
  icon?: string;
  chapters: SeedChapter[];
}

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

const SEED: SeedSubject[] = [
  {
    key: "java",
    label: "Java",
    icon: "Coffee",
    chapters: [
      {
        title: "Introduction",
        pages: [
          {
            title: "1 What Is Java",
            tags: ["java", "fundamentals"],
            content: `# What Is Java

## 📌 Introduction

**Java** is a high-level, class-based, object-oriented programming language designed to have as few implementation dependencies as possible.

## ⚙️ Simple Definition

> "Write Once, Run Anywhere"

Java code is compiled to **bytecode** that runs on any platform with a Java Virtual Machine (JVM), rather than to a single platform's native machine code.

## Key Points

- **Platform independent** at the bytecode level.
- **Object-oriented** — everything lives inside classes.
- **Strongly typed** and statically checked at compile time.
- Managed memory with automatic **garbage collection**.

\`\`\`java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
\`\`\`

---

A program is written once, compiled to bytecode, and that same bytecode runs unchanged across Windows, macOS, and Linux.`,
          },
          {
            title: "2 History Of Java",
            tags: ["java", "history"],
            content: `# History Of Java

## 📌 Origins

Java began in **1991** as a project at Sun Microsystems led by **James Gosling**, originally named **Oak**, then **Green**, before becoming **Java** in 1995.

## Timeline

- **1995** — Java 1.0 released publicly.
- **2006-2007** — Sun open-sourced Java as OpenJDK.
- **2010** — Oracle acquired Sun Microsystems.
- **Today** — a new feature release ships roughly every six months.

> Java was designed for digital devices first, but found its home on the web and the server.`,
          },
          {
            title: "3 Features Of Java",
            tags: ["java", "features"],
            content: `# Features Of Java

## ⚙️ Core Features

- **Simple** — clean syntax, no explicit pointers.
- **Object-Oriented** — encapsulation, inheritance, polymorphism, abstraction.
- **Platform Independent** — bytecode + JVM.
- **Secure** — runs inside a sandboxed runtime.
- **Robust** — strong type checking and exception handling.
- **Multithreaded** — built-in concurrency support.
- **Portable** — no implementation-dependent primitive sizes.

---

These features together make Java a dependable choice for large, long-lived systems.`,
          },
          {
            title: "4 Java Editions",
            tags: ["java", "editions"],
            content: `# Java Editions

Java ships in three editions targeting different environments:

- **Java SE (Standard Edition)** — the core language and standard libraries.
- **Java EE / Jakarta EE (Enterprise Edition)** — APIs for large-scale, distributed, server-side applications.
- **Java ME (Micro Edition)** — a subset for constrained and embedded devices.

> Most day-to-day application development targets **Java SE**.`,
          },
          {
            title: "5 Program Structure",
            tags: ["java", "syntax"],
            content: `# Program Structure

A minimal Java program is a **class** containing a \`main\` method:

\`\`\`java
package com.example;

public class App {
    public static void main(String[] args) {
        int x = 10;
        System.out.println("Value is " + x);
    }
}
\`\`\`

## Anatomy

- **package** — namespace the class belongs to.
- **class** — the unit of code; the file name matches the public class name.
- **main** — the JVM entry point: \`public static void main(String[] args)\`.

---

Execution always begins at \`main\`.`,
          },
          {
            title: "6 Java Program Execution Flow",
            tags: ["java", "jvm"],
            content: `# Java Program Execution Flow

## Steps

1. **Write** source code in a \`.java\` file.
2. **Compile** with \`javac\` → produces \`.class\` **bytecode**.
3. **Load** the bytecode into the JVM via the class loader.
4. **Verify** the bytecode for safety.
5. **Execute** — the interpreter and JIT compiler run the bytecode.

\`\`\`bash
javac App.java   # source -> bytecode
java App         # run bytecode on the JVM
\`\`\`

> The JIT (Just-In-Time) compiler turns hot bytecode into native code at runtime for speed.`,
          },
          {
            title: "7 Jdk Jre And Jvm",
            tags: ["java", "jvm", "jdk", "jre"],
            content: `# JDK, JRE and JVM

These three are often confused. They nest inside one another:

- **JVM (Java Virtual Machine)** — executes bytecode. Platform-specific.
- **JRE (Java Runtime Environment)** — JVM **plus** the standard libraries needed to *run* programs.
- **JDK (Java Development Kit)** — JRE **plus** development tools (\`javac\`, \`jar\`, debugger) needed to *build* programs.

> JDK ⊃ JRE ⊃ JVM

---

Install the **JDK** to develop; the **JRE** alone is enough only to run.`,
          },
          {
            title: "Understanding Heap Memory Allocation",
            tags: ["java", "memory", "heap"],
            content: `# Understanding Heap Memory Allocation

## 📌 The Heap

The **heap** is the runtime area where all **objects** and arrays are allocated. It is shared across all threads and managed by the **garbage collector**.

## Stack vs Heap

- **Stack** — per-thread; holds local variables and method frames.
- **Heap** — shared; holds objects created with \`new\`.

\`\`\`java
// reference 'p' lives on the stack;
// the Point object lives on the heap.
Point p = new Point(1, 2);
\`\`\`

> When no live reference points to an object, it becomes eligible for garbage collection.`,
          },
        ],
      },
      {
        title: "Fundamentals",
        pages: [
          {
            title: "1 Variables",
            tags: ["java", "variables"],
            content: `# Variables

A **variable** is a named container for a value of a declared type.

\`\`\`java
int count = 5;
String name = "Ada";
final double PI = 3.14159; // constant
\`\`\`

## Kinds of Variables

- **Local** — declared inside a method; must be initialized before use.
- **Instance** — per-object fields.
- **Static** — shared across all instances of a class.

> Use \`final\` for values that should never change after assignment.`,
          },
          {
            title: "2 Data Types",
            tags: ["java", "types"],
            content: `# Data Types

Java types split into two groups:

## Primitive Types

\`byte\`, \`short\`, \`int\`, \`long\`, \`float\`, \`double\`, \`char\`, \`boolean\`.

## Reference Types

Objects, arrays, and \`String\` — variables hold a **reference** to the value, not the value itself.

\`\`\`java
int a = 42;            // primitive: holds the value
String s = "hello";    // reference: holds a pointer to the object
\`\`\`

> Primitives have fixed, platform-independent sizes — an \`int\` is always 32 bits.`,
          },
          {
            title: "3 Literals",
            tags: ["java", "literals"],
            content: `# Literals

A **literal** is a fixed value written directly in source code.

- **Integer**: \`42\`, \`0xFF\`, \`0b1010\`, \`1_000_000\`
- **Floating point**: \`3.14\`, \`2.0e8\`
- **Character**: \`'A'\`, \`'\\n'\`
- **String**: \`"text"\`
- **Boolean**: \`true\`, \`false\`

\`\`\`java
long big = 1_000_000L;   // underscores improve readability
\`\`\`

> The \`L\` suffix marks a \`long\`; \`f\` marks a \`float\`.`,
          },
        ],
      },
    ],
  },
  {
    key: "javascript",
    label: "JavaScript",
    icon: "Braces",
    chapters: [
      {
        title: "Basics",
        pages: [
          {
            title: "Variables And Scope",
            tags: ["javascript", "variables", "scope"],
            content: `# Variables And Scope

JavaScript has three declaration keywords:

- **var** — function-scoped, hoisted (avoid in modern code).
- **let** — block-scoped, reassignable.
- **const** — block-scoped, not reassignable.

\`\`\`js
const name = "Ada";
let count = 0;
count += 1;
\`\`\`

> Prefer \`const\` by default and reach for \`let\` only when reassignment is needed.`,
          },
        ],
      },
      {
        title: "Asynchronous JS & the Event Loop",
        pages: [
          {
            title: "The Event Loop",
            tags: ["javascript", "async", "event-loop"],
            content: `# The Event Loop

JavaScript is **single-threaded** but non-blocking, thanks to the **event loop**.

## How it works

1. Synchronous code runs on the **call stack**.
2. Async callbacks wait in the **task** / **microtask** queues.
3. When the stack is empty, the loop pulls the next callback to run.

\`\`\`js
console.log("1");
Promise.resolve().then(() => console.log("3"));
console.log("2");
// Output: 1, 2, 3  (the promise callback is a microtask)
\`\`\`

> Microtasks (promises) run before the next macrotask (setTimeout).`,
          },
        ],
      },
      {
        title: "ES6+ Features",
        pages: [
          {
            title: "Destructuring And Spread",
            tags: ["javascript", "es6"],
            content: `# Destructuring And Spread

\`\`\`js
const [first, ...rest] = [1, 2, 3];   // first = 1, rest = [2, 3]
const { name, age } = person;           // pull fields by name
const merged = { ...a, ...b };          // shallow merge
\`\`\`

> Spread copies shallowly — nested objects are still shared by reference.`,
          },
        ],
      },
    ],
  },
  {
    key: "dsa",
    label: "DSA",
    icon: "Binary",
    chapters: [
      {
        title: "Arrays & Strings",
        pages: [
          {
            title: "Two Pointer Technique",
            tags: ["dsa", "arrays", "two-pointers"],
            content: `# Two Pointer Technique

The **two pointer** pattern uses two indices moving through a sequence to solve problems in **O(n)** time and **O(1)** space.

\`\`\`js
function isPalindrome(s) {
  let i = 0, j = s.length - 1;
  while (i < j) {
    if (s[i] !== s[j]) return false;
    i++; j--;
  }
  return true;
}
\`\`\`

> Common uses: palindromes, pair-sum on a sorted array, reversing in place.`,
          },
        ],
      },
      {
        title: "Linked Lists",
        pages: [
          {
            title: "Reversing A Linked List",
            tags: ["dsa", "linked-list"],
            content: `# Reversing A Linked List

Reverse the \`next\` pointers iteratively in a single pass.

\`\`\`js
function reverse(head) {
  let prev = null;
  while (head) {
    const next = head.next;
    head.next = prev;
    prev = head;
    head = next;
  }
  return prev;
}
\`\`\`

> Time **O(n)**, space **O(1)** — track \`prev\`, \`curr\`, and the saved \`next\`.`,
          },
        ],
      },
      {
        title: "Trees & Graphs",
        pages: [
          {
            title: "BFS vs DFS",
            tags: ["dsa", "graphs", "bfs", "dfs"],
            content: `# BFS vs DFS

Two foundational traversals:

- **BFS (Breadth-First Search)** — explores level by level using a **queue**. Finds shortest paths in unweighted graphs.
- **DFS (Depth-First Search)** — explores as deep as possible using a **stack** / recursion.

> Reach for BFS when you need the shortest number of hops; DFS for connectivity, cycles, and topological order.`,
          },
        ],
      },
      {
        title: "Dynamic Programming",
        pages: [
          {
            title: "Memoization Basics",
            tags: ["dsa", "dp", "memoization"],
            content: `# Memoization Basics

**Dynamic programming** trades memory for speed by caching solutions to overlapping subproblems.

\`\`\`js
function fib(n, memo = {}) {
  if (n <= 1) return n;
  if (memo[n] !== undefined) return memo[n];
  return (memo[n] = fib(n - 1, memo) + fib(n - 2, memo));
}
\`\`\`

> Memoization turns exponential recursion into **O(n)**.`,
          },
        ],
      },
    ],
  },
  {
    key: "system-design",
    label: "System Design",
    icon: "Network",
    chapters: [
      {
        title: "Fundamentals",
        pages: [
          {
            title: "Latency vs Throughput",
            tags: ["system-design", "performance"],
            content: `# Latency vs Throughput

- **Latency** — time to handle a single request (e.g. 50 ms).
- **Throughput** — number of requests handled per unit time (e.g. 10k req/s).

> Optimizing one does not guarantee the other; batching can raise throughput while increasing latency.`,
          },
        ],
      },
      {
        title: "Scalability & Caching",
        pages: [
          {
            title: "Caching Strategies",
            tags: ["system-design", "caching"],
            content: `# Caching Strategies

Common patterns:

- **Cache-aside** — app reads cache, falls back to the DB and populates on miss.
- **Write-through** — writes go to cache and DB together.
- **Write-back** — writes hit cache first, flush to DB later.

> Always define a **TTL** and an **eviction policy** (LRU is the usual default).`,
          },
        ],
      },
      {
        title: "Databases & Sharding",
        pages: [
          {
            title: "Sharding Basics",
            tags: ["system-design", "databases", "sharding"],
            content: `# Sharding Basics

**Sharding** splits one dataset across multiple databases by a **shard key**.

- **Range-based** — partition by key ranges.
- **Hash-based** — hash the key to distribute evenly.

> A poorly chosen shard key creates **hotspots** — pick one with high cardinality and even access.`,
          },
        ],
      },
    ],
  },
  {
    key: "behavioral",
    label: "Behavioral",
    icon: "Users",
    chapters: [
      {
        title: "The STAR Method",
        pages: [
          {
            title: "Structuring Answers With STAR",
            tags: ["behavioral", "star"],
            content: `# Structuring Answers With STAR

**STAR** keeps behavioral answers focused:

- **S**ituation — set the context.
- **T**ask — what you were responsible for.
- **A**ction — what *you* specifically did.
- **R**esult — the measurable outcome.

> Spend most of your time on **Action** and **Result** — that is what interviewers score.`,
          },
        ],
      },
      {
        title: "Common Questions",
        pages: [
          {
            title: "Tell Me About Yourself",
            tags: ["behavioral", "questions"],
            content: `# Tell Me About Yourself

A strong answer follows **Present → Past → Future**:

1. **Present** — your current role and focus.
2. **Past** — the experience that led you here.
3. **Future** — why this role is the logical next step.

> Keep it under two minutes and tailor the "future" to the company.`,
          },
        ],
      },
      {
        title: "Salary Negotiation",
        pages: [
          {
            title: "Negotiation Principles",
            tags: ["behavioral", "negotiation"],
            content: `# Negotiation Principles

- **Never give the first number** if you can avoid it.
- **Anchor on market data**, not your current salary.
- **Negotiate the whole package** — base, equity, signing bonus, start date.

> Silence is a tool — after stating a number, stop talking.`,
          },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Seeder
// ---------------------------------------------------------------------------

export interface SeedSummary {
  seeded: boolean;
  subjects: number;
  chapters: number;
  pages: number;
}

/** Resolve a User id to attribute seeded pages to (prefers an admin). */
const resolveAuthor = async (): Promise<mongoose.Types.ObjectId> => {
  const admin = await User.findOne({ isAdmin: true }).select("_id");
  if (admin?._id) return admin._id as mongoose.Types.ObjectId;
  const any = await User.findOne().select("_id");
  if (any?._id) return any._id as mongoose.Types.ObjectId;
  // No users yet — attribute to a fresh id so content still seeds/renders.
  return new mongoose.Types.ObjectId();
};

/**
 * Insert the predefined content. Idempotent: returns early without touching
 * the DB when any Subject already exists.
 */
export const seedInterviewPrep = async (): Promise<SeedSummary> => {
  await connectdb();

  const existing = await Subject.countDocuments();
  if (existing > 0) {
    return { seeded: false, subjects: 0, chapters: 0, pages: 0 };
  }

  const author = await resolveAuthor();
  const takenSlugs = new Set<string>();
  let subjectCount = 0;
  let chapterCount = 0;
  let pageCount = 0;

  for (let s = 0; s < SEED.length; s++) {
    const subjectSeed = SEED[s];
    const subject = await Subject.create({
      key: subjectSeed.key,
      label: subjectSeed.label,
      icon: subjectSeed.icon,
      order: s,
    });
    subjectCount++;

    for (let c = 0; c < subjectSeed.chapters.length; c++) {
      const chapterSeed = subjectSeed.chapters[c];
      const chapter = await Chapter.create({
        subjectId: subject._id,
        title: chapterSeed.title,
        order: c,
      });
      chapterCount++;

      for (let p = 0; p < chapterSeed.pages.length; p++) {
        const pageSeed = chapterSeed.pages[p];
        // Unique slug across the whole library.
        let slug = slugify(`${subjectSeed.key}-${pageSeed.title}`);
        if (takenSlugs.has(slug)) {
          let n = 2;
          while (takenSlugs.has(`${slug}-${n}`)) n++;
          slug = `${slug}-${n}`;
        }
        takenSlugs.add(slug);

        await Page.create({
          title: pageSeed.title,
          slug,
          chapterId: chapter._id,
          order: p,
          icon: pageSeed.icon,
          content: pageSeed.content,
          status: "published",
          tags: pageSeed.tags ?? [],
          viewCount: 0,
          likeCount: 0,
          createdBy: author,
        });
        pageCount++;
      }
    }
  }

  return {
    seeded: true,
    subjects: subjectCount,
    chapters: chapterCount,
    pages: pageCount,
  };
};
