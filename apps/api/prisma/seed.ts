import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create demo user + org
  const password = await bcrypt.hash("demo1234", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@commoncents.app" },
    update: {},
    create: {
      email: "demo@commoncents.app",
      password,
      name: "Demo User",
      organizations: {
        create: {
          role: "OWNER",
          organization: {
            create: {
              name: "Demo Business",
              bizInfo: {
                create: {
                  name: "Demo Business LLC",
                  email: "hello@demobusiness.com",
                  phone: "(555) 123-4567",
                  address: "123 Main St, Anytown, USA",
                },
              },
            },
          },
        },
      },
    },
    include: { organizations: true },
  });

  const orgId = user.organizations[0].organizationId;

  // Seed default chart of accounts
  const accounts = [
    { code: "1000", name: "Cash", type: "ASSET" as const },
    { code: "1100", name: "Accounts Receivable", type: "ASSET" as const },
    { code: "1200", name: "Inventory", type: "ASSET" as const },
    { code: "1500", name: "Equipment", type: "ASSET" as const },
    { code: "2000", name: "Accounts Payable", type: "LIABILITY" as const },
    { code: "2100", name: "Credit Card", type: "LIABILITY" as const },
    { code: "2500", name: "Loans Payable", type: "LIABILITY" as const },
    { code: "3000", name: "Owner's Equity", type: "EQUITY" as const },
    { code: "3100", name: "Retained Earnings", type: "EQUITY" as const },
    { code: "4000", name: "Sales Revenue", type: "REVENUE" as const },
    { code: "4100", name: "Service Revenue", type: "REVENUE" as const },
    { code: "5000", name: "Cost of Goods Sold", type: "EXPENSE" as const },
    { code: "6000", name: "Rent Expense", type: "EXPENSE" as const },
    { code: "6100", name: "Utilities Expense", type: "EXPENSE" as const },
    { code: "6200", name: "Salaries Expense", type: "EXPENSE" as const },
    { code: "6300", name: "Office Supplies", type: "EXPENSE" as const },
  ];

  for (const account of accounts) {
    await prisma.account.upsert({
      where: { code_organizationId: { code: account.code, organizationId: orgId } },
      update: {},
      create: { ...account, organizationId: orgId },
    });
  }

  console.log("Seed complete: demo@commoncents.app / demo1234");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
