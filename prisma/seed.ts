import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || "Admin123!",
    12
  );
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || "admin@codeguard.ai" },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || "admin@codeguard.ai",
      name: "System Admin",
      passwordHash: adminPassword,
      role: "ADMIN",
      emailVerified: true,
      subscription: {
        create: {
          plan: "ENTERPRISE",
          status: "ACTIVE",
          scansLimit: 999999,
        },
      },
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // Create demo user
  const demoPassword = await bcrypt.hash("Demo123!", 12);
  const demo = await prisma.user.upsert({
    where: { email: "demo@codeguard.ai" },
    update: {},
    create: {
      email: "demo@codeguard.ai",
      name: "Demo User",
      passwordHash: demoPassword,
      role: "USER",
      emailVerified: true,
      avatarUrl: "https://avatars.githubusercontent.com/u/0",
      subscription: {
        create: {
          plan: "PRO",
          status: "ACTIVE",
          scansLimit: 999999,
        },
      },
    },
  });
  console.log("✅ Demo user created:", demo.email);

  // Create sample reviews for demo
  const sampleReviews = [
    {
      title: "User Authentication Module",
      language: "typescript",
      sourceType: "PASTE" as const,
      sourceCode: `function login(username, password) {\n  const query = "SELECT * FROM users WHERE username = '" + username + "'";\n  // SQL injection vulnerability!\n  return db.query(query);\n}`,
      status: "COMPLETED" as const,
      overallScore: 32,
      qualityScore: 45,
      securityScore: 12,
      performanceScore: 48,
      maintainabilityScore: 50,
      summary:
        "Critical security vulnerabilities detected. SQL injection risk present. Immediate remediation required.",
      aiProvider: "openai",
      aiModel: "gpt-4o",
      processingTime: 2340,
    },
    {
      title: "API Rate Limiter",
      language: "javascript",
      sourceType: "PASTE" as const,
      sourceCode: `const rateLimit = new Map();\nfunction checkLimit(ip) {\n  const count = rateLimit.get(ip) || 0;\n  rateLimit.set(ip, count + 1);\n  return count < 100;\n}`,
      status: "COMPLETED" as const,
      overallScore: 72,
      qualityScore: 78,
      securityScore: 70,
      performanceScore: 65,
      maintainabilityScore: 75,
      summary:
        "Good implementation with minor improvements needed. Memory leak risk with unbounded Map growth.",
      aiProvider: "openai",
      aiModel: "gpt-4o",
      processingTime: 1890,
    },
    {
      title: "Data Processing Pipeline",
      language: "python",
      sourceType: "PASTE" as const,
      sourceCode: `def process_data(items):\n    result = []\n    for i in range(len(items)):\n        result.append(items[i] * 2)\n    return result`,
      status: "COMPLETED" as const,
      overallScore: 85,
      qualityScore: 88,
      securityScore: 90,
      performanceScore: 76,
      maintainabilityScore: 86,
      summary:
        "Good code with performance optimization opportunities. Consider using list comprehensions.",
      aiProvider: "openai",
      aiModel: "gpt-4o",
      processingTime: 1234,
    },
  ];

  for (const review of sampleReviews) {
    await prisma.review.create({
      data: {
        ...review,
        userId: demo.id,
        issues: {
          create:
            review.securityScore < 50
              ? [
                  {
                    type: "SECURITY",
                    severity: "CRITICAL",
                    title: "SQL Injection Vulnerability",
                    description:
                      "User input is directly concatenated into SQL query without sanitization.",
                    lineStart: 2,
                    lineEnd: 2,
                    suggestion:
                      "Use parameterized queries or prepared statements.",
                    fixedCode: `const query = "SELECT * FROM users WHERE username = $1";\nreturn db.query(query, [username]);`,
                  },
                ]
              : [
                  {
                    type: "PERFORMANCE",
                    severity: "LOW",
                    title: "Inefficient Loop Pattern",
                    description: "Using index-based loop instead of direct iteration.",
                    lineStart: 3,
                    lineEnd: 5,
                    suggestion: "Use direct iteration or list comprehension for better performance.",
                    fixedCode: `def process_data(items):\n    return [item * 2 for item in items]`,
                  },
                ],
        },
        recommendations: {
          create: [
            {
              category: "Security",
              title: "Implement Input Validation",
              description:
                "Always validate and sanitize user inputs before processing.",
              priority: 1,
            },
          ],
        },
      },
    });
  }

  console.log("✅ Sample reviews created");
  console.log("\n🎉 Seeding complete!");
  console.log("\nDemo credentials:");
  console.log("  Admin: admin@codeguard.ai / Admin123!");
  console.log("  User:  demo@codeguard.ai / Demo123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
