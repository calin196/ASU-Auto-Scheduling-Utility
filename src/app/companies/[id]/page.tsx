import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import CompanyServiceClient from "./CompanyServiceClient";

export default async function CompanyServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const cookieStore = await cookies();
  const userRole = cookieStore.get("userRole")?.value;

  if (!userRole) {
    redirect("/login");
  }

  const { id } = await params;

  if (id === "all") {
    return <CompanyServiceClient applyToAll />;
  }

  const companyId = Number(id);

  if (!Number.isInteger(companyId)) {
    notFound();
  }

  const company = await prisma.user.findFirst({
    where: {
      id: companyId,
      role: 1,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
    },
  });

  if (!company) {
    notFound();
  }

  return <CompanyServiceClient company={company} />;
}