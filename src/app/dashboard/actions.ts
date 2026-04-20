"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

function parseDateTimeInput(value: string) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return null;

  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return null;

  return date;
}

export async function logoutUser() {
  const cookieStore = await cookies();

  cookieStore.delete("userId");
  cookieStore.delete("userRole");
  cookieStore.delete("userName");

  redirect("/login");
}

export async function declineServiceRequest(requestId: number) {
  try {
    const cookieStore = await cookies();
    const userId = Number(cookieStore.get("userId")?.value);
    const userRole = cookieStore.get("userRole")?.value;

    if (!userId || userRole !== "1") {
      return {
        success: false,
        error: "Only providers can decline requests.",
      };
    }

    const request = await prisma.serviceRequest.findFirst({
      where: {
        id: requestId,
        providerId: userId,
      },
      select: {
        id: true,
      },
    });

    if (!request) {
      return {
        success: false,
        error: "Request not found.",
      };
    }

    await prisma.serviceRequest.delete({
      where: {
        id: requestId,
      },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    console.error("declineServiceRequest error:", error);
    return {
      success: false,
      error: "Failed to decline request.",
    };
  }
}

export async function acceptServiceRequest(input: {
  requestId: number;
  quotedPrice: number;
  isNegotiable: boolean;
}) {
  try {
    const cookieStore = await cookies();
    const userId = Number(cookieStore.get("userId")?.value);
    const userRole = cookieStore.get("userRole")?.value;

    if (!userId || userRole !== "1") {
      return {
        success: false,
        error: "Only providers can accept requests.",
      };
    }

    const request = await prisma.serviceRequest.findFirst({
      where: {
        id: input.requestId,
        providerId: userId,
      },
      select: {
        id: true,
      },
    });

    if (!request) {
      return {
        success: false,
        error: "Request not found.",
      };
    }

    if (!Number.isFinite(input.quotedPrice) || input.quotedPrice <= 0) {
      return {
        success: false,
        error: "Please enter a valid price.",
      };
    }

    await prisma.serviceRequest.update({
      where: {
        id: input.requestId,
      },
      data: {
        status: "accepted",
        quotedPrice: input.quotedPrice,
        isNegotiable: input.isNegotiable,
        clientCounterPrice: null,
        unreadForClient: true,
        unreadForProvider: false,
        scheduleStatus: "awaiting_client_date",
        appointmentDate: null,
        appointmentMessage: null,
        lastDateProposedBy: null,
      },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    console.error("acceptServiceRequest error:", error);
    return {
      success: false,
      error: "Failed to accept request.",
    };
  }
}

export async function markClientMessagesRead() {
  try {
    const cookieStore = await cookies();
    const userId = Number(cookieStore.get("userId")?.value);
    const userRole = cookieStore.get("userRole")?.value;

    if (!userId || userRole !== "0") {
      return {
        success: false,
      };
    }

    await prisma.serviceRequest.updateMany({
      where: {
        clientId: userId,
        unreadForClient: true,
      },
      data: {
        unreadForClient: false,
      },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    console.error("markClientMessagesRead error:", error);
    return {
      success: false,
    };
  }
}

export async function sendCounterOffer(input: {
  requestId: number;
  counterPrice: number;
}) {
  try {
    const cookieStore = await cookies();
    const userId = Number(cookieStore.get("userId")?.value);
    const userRole = cookieStore.get("userRole")?.value;

    if (!userId || userRole !== "0") {
      return {
        success: false,
        error: "Only clients can send a counter-offer.",
      };
    }

    const request = await prisma.serviceRequest.findFirst({
      where: {
        id: input.requestId,
        clientId: userId,
      },
      select: {
        id: true,
        status: true,
        isNegotiable: true,
      },
    });

    if (!request) {
      return {
        success: false,
        error: "Request not found.",
      };
    }

    if (request.status !== "accepted") {
      return {
        success: false,
        error: "You can only negotiate accepted offers.",
      };
    }

    if (!request.isNegotiable) {
      return {
        success: false,
        error: "This offer is not negotiable.",
      };
    }

    if (!Number.isFinite(input.counterPrice) || input.counterPrice <= 0) {
      return {
        success: false,
        error: "Please enter a valid counter price.",
      };
    }

    await prisma.serviceRequest.update({
      where: {
        id: input.requestId,
      },
      data: {
        status: "pending",
        clientCounterPrice: input.counterPrice,
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
      message: "Counter-offer sent successfully.",
    };
  } catch (error) {
    console.error("sendCounterOffer error:", error);
    return {
      success: false,
      error: "Failed to send counter-offer.",
    };
  }
}

export async function proposeAppointmentDateByClient(input: {
  requestId: number;
  appointmentDate: string;
}) {
  try {
    const cookieStore = await cookies();
    const userId = Number(cookieStore.get("userId")?.value);
    const userRole = cookieStore.get("userRole")?.value;

    if (!userId || userRole !== "0") {
      return {
        success: false,
        error: "Only clients can propose a date.",
      };
    }

    const request = await prisma.serviceRequest.findFirst({
      where: {
        id: input.requestId,
        clientId: userId,
      },
      select: {
        id: true,
        status: true,
        scheduleStatus: true,
      },
    });

    if (!request) {
      return {
        success: false,
        error: "Request not found.",
      };
    }

    if (request.status !== "accepted") {
      return {
        success: false,
        error: "This request is not ready for scheduling.",
      };
    }

    if (request.scheduleStatus !== "awaiting_client_date") {
      return {
        success: false,
        error: "You cannot propose a date right now.",
      };
    }

    const parsedDate = parseDateTimeInput(input.appointmentDate);

    if (!parsedDate) {
      return {
        success: false,
        error: "Please choose a valid date and time.",
      };
    }

    await prisma.serviceRequest.update({
      where: {
        id: input.requestId,
      },
      data: {
        appointmentDate: parsedDate,
        appointmentMessage: null,
        lastDateProposedBy: "client",
        scheduleStatus: "awaiting_provider_response",
        unreadForClient: false,
        unreadForProvider: true,
      },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Date sent to provider.",
    };
  } catch (error) {
    console.error("proposeAppointmentDateByClient error:", error);
    return {
      success: false,
      error: "Failed to send the date.",
    };
  }
}

export async function providerRespondToClientDate(input: {
  requestId: number;
  accept: boolean;
  appointmentDate?: string;
  reason?: string;
}) {
  try {
    const cookieStore = await cookies();
    const userId = Number(cookieStore.get("userId")?.value);
    const userRole = cookieStore.get("userRole")?.value;

    if (!userId || userRole !== "1") {
      return {
        success: false,
        error: "Only providers can answer the appointment request.",
      };
    }

    const request = await prisma.serviceRequest.findFirst({
      where: {
        id: input.requestId,
        providerId: userId,
      },
      select: {
        id: true,
        status: true,
        scheduleStatus: true,
        lastDateProposedBy: true,
        appointmentDate: true,
      },
    });

    if (!request) {
      return {
        success: false,
        error: "Request not found.",
      };
    }

    if (request.status !== "accepted") {
      return {
        success: false,
        error: "This request is not in scheduling mode.",
      };
    }

    if (
      request.scheduleStatus !== "awaiting_provider_response" ||
      request.lastDateProposedBy !== "client"
    ) {
      return {
        success: false,
        error: "There is no client date waiting for your answer.",
      };
    }

    if (input.accept) {
      await prisma.serviceRequest.update({
        where: {
          id: input.requestId,
        },
        data: {
          scheduleStatus: "scheduled",
          appointmentMessage: "Provider accepted your requested date.",
          unreadForClient: true,
          unreadForProvider: false,
        },
      });

      revalidatePath("/dashboard");

      return {
        success: true,
        message: "Appointment date accepted.",
      };
    }

    const parsedDate = parseDateTimeInput(String(input.appointmentDate || ""));
    const reason = String(input.reason || "").trim();

    if (!parsedDate) {
      return {
        success: false,
        error: "Please propose a valid new date.",
      };
    }

    if (!reason) {
      return {
        success: false,
        error: "Please write a reason.",
      };
    }

    await prisma.serviceRequest.update({
      where: {
        id: input.requestId,
      },
      data: {
        appointmentDate: parsedDate,
        appointmentMessage: reason,
        lastDateProposedBy: "provider",
        scheduleStatus: "awaiting_client_response",
        unreadForClient: true,
        unreadForProvider: false,
      },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      message: "New date proposed to client.",
    };
  } catch (error) {
    console.error("providerRespondToClientDate error:", error);
    return {
      success: false,
      error: "Failed to answer the client date.",
    };
  }
}

export async function clientRespondToProviderDate(input: {
  requestId: number;
  accept: boolean;
  appointmentDate?: string;
  reason?: string;
}) {
  try {
    const cookieStore = await cookies();
    const userId = Number(cookieStore.get("userId")?.value);
    const userRole = cookieStore.get("userRole")?.value;

    if (!userId || userRole !== "0") {
      return {
        success: false,
        error: "Only clients can answer the provider date.",
      };
    }

    const request = await prisma.serviceRequest.findFirst({
      where: {
        id: input.requestId,
        clientId: userId,
      },
      select: {
        id: true,
        status: true,
        scheduleStatus: true,
        lastDateProposedBy: true,
      },
    });

    if (!request) {
      return {
        success: false,
        error: "Request not found.",
      };
    }

    if (request.status !== "accepted") {
      return {
        success: false,
        error: "This request is not in scheduling mode.",
      };
    }

    if (
      request.scheduleStatus !== "awaiting_client_response" ||
      request.lastDateProposedBy !== "provider"
    ) {
      return {
        success: false,
        error: "There is no provider date waiting for your answer.",
      };
    }

    if (input.accept) {
      await prisma.serviceRequest.update({
        where: {
          id: input.requestId,
        },
        data: {
          scheduleStatus: "scheduled",
          appointmentMessage: "Client accepted the proposed date.",
          unreadForClient: false,
          unreadForProvider: true,
        },
      });

      revalidatePath("/dashboard");

      return {
        success: true,
        message: "Appointment confirmed.",
      };
    }

    const parsedDate = parseDateTimeInput(String(input.appointmentDate || ""));
    const reason = String(input.reason || "").trim();

    if (!parsedDate) {
      return {
        success: false,
        error: "Please propose a valid new date.",
      };
    }

    if (!reason) {
      return {
        success: false,
        error: "Please write a reason.",
      };
    }

    await prisma.serviceRequest.update({
      where: {
        id: input.requestId,
      },
      data: {
        appointmentDate: parsedDate,
        appointmentMessage: reason,
        lastDateProposedBy: "client",
        scheduleStatus: "awaiting_provider_response",
        unreadForClient: false,
        unreadForProvider: true,
      },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      message: "New date sent to provider.",
    };
  } catch (error) {
    console.error("clientRespondToProviderDate error:", error);
    return {
      success: false,
      error: "Failed to answer the provider date.",
    };
  }
}