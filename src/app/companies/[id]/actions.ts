"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

type SendServiceRequestInput = {
  providerId: number;
  serviceType: string;
  category?: string;
  exactIssue?: string;
};

type SendServiceRequestToAllInput = {
  serviceType: string;
  category?: string;
  exactIssue?: string;
};

export async function sendServiceRequest(input: SendServiceRequestInput) {
  try {
    const cookieStore = await cookies();
    const clientId = Number(cookieStore.get("userId")?.value);
    const userRole = cookieStore.get("userRole")?.value;

    if (!clientId || userRole !== "0") {
      return {
        success: false,
        error: "You must be logged in as a client.",
      };
    }

    const provider = await prisma.user.findFirst({
      where: {
        id: input.providerId,
        role: 1,
      },
      select: {
        id: true,
      },
    });

    if (!provider) {
      return {
        success: false,
        error: "Company not found.",
      };
    }

    const serviceType = String(input.serviceType || "").trim();
    const category = String(input.category || "").trim();
    const exactIssue = String(input.exactIssue || "").trim();

    if (!serviceType) {
      return {
        success: false,
        error: "Please select a service first.",
      };
    }

    await prisma.serviceRequest.create({
      data: {
        clientId,
        providerId: input.providerId,
        serviceType,
        category: category || null,
        exactIssue: exactIssue || null,
        unreadForClient: false,
        unreadForProvider: true,
        scheduleStatus: "none",
        appointmentDate: null,
        appointmentMessage: null,
        lastDateProposedBy: null,
      },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Request sent successfully.",
    };
  } catch (error) {
    console.error("sendServiceRequest error:", error);
    return {
      success: false,
      error: "Failed to send request.",
    };
  }
}

export async function sendServiceRequestToAll(
  input: SendServiceRequestToAllInput
) {
  try {
    const cookieStore = await cookies();
    const clientId = Number(cookieStore.get("userId")?.value);
    const userRole = cookieStore.get("userRole")?.value;

    if (!clientId || userRole !== "0") {
      return {
        success: false,
        error: "You must be logged in as a client.",
      };
    }

    const providers = await prisma.user.findMany({
      where: {
        role: 1,
      },
      select: {
        id: true,
      },
    });

    if (providers.length === 0) {
      return {
        success: false,
        error: "No companies found.",
      };
    }

    const serviceType = String(input.serviceType || "").trim();
    const category = String(input.category || "").trim();
    const exactIssue = String(input.exactIssue || "").trim();

    if (!serviceType) {
      return {
        success: false,
        error: "Please select a service first.",
      };
    }

    await prisma.serviceRequest.createMany({
      data: providers.map((provider) => ({
        clientId,
        providerId: provider.id,
        serviceType,
        category: category || null,
        exactIssue: exactIssue || null,
        unreadForClient: false,
        unreadForProvider: true,
        scheduleStatus: "none",
        appointmentDate: null,
        appointmentMessage: null,
        lastDateProposedBy: null,
      })),
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Request sent to ${providers.length} companies successfully.`,
    };
  } catch (error) {
    console.error("sendServiceRequestToAll error:", error);
    return {
      success: false,
      error: "Failed to send request to all companies.",
    };
  }
}