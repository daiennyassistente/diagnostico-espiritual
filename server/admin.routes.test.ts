import { beforeEach, describe, expect, it, vi } from "vitest";
import { TRPCError } from "@trpc/server";
import type { TrpcContext } from "./_core/context";

const getAdminSnapshotMock = vi.fn();
const getAdminDashboardSummaryMock = vi.fn();
const getAdminUsersMock = vi.fn();
const getAdminBuyersMock = vi.fn();
const getAdminDiagnosticResultsMock = vi.fn();

vi.mock("./db", () => ({
  createDiagnosticHistoryEntry: vi.fn(),
  createLead: vi.fn(),
  createQuizResponse: vi.fn(),
  getAdminSnapshot: getAdminSnapshotMock,
  getAdminDashboardSummary: getAdminDashboardSummaryMock,
  getAdminUsers: getAdminUsersMock,
  getAdminBuyers: getAdminBuyersMock,
  getAdminDiagnosticResults: getAdminDiagnosticResultsMock,
  getAllQuizResponses: vi.fn(),
  getResponseStatistics: vi.fn(),
}));

const { appRouter } = await import("./routers");

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(role: "admin" | "user" | null): TrpcContext {
  const user: AuthenticatedUser | null = role
    ? {
        id: 1,
        openId: role === "admin" ? "admin-open-id" : "user-open-id",
        email: role === "admin" ? "admin@example.com" : "user@example.com",
        name: role === "admin" ? "Admin" : "User",
        loginMethod: "manus",
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      }
    : null;

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("admin router protection and data access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows admins to load the full snapshot", async () => {
    const snapshot = {
      summary: {
        kpis: {
          totalUsuarios: 2,
          novosUsuarios30Dias: 1,
          totalLeads: 10,
          leads30Dias: 5,
          totalCompras: 3,
          comprasAprovadas: 2,
          receitaTotal: 1980,
          totalDiagnosticos: 8,
          diagnosticos30Dias: 4,
          taxaConversao: 20,
        },
        timeline: [],
        perfilDistribuicao: [],
      },
      users: [],
      buyers: [],
      diagnostics: [],
    };

    getAdminSnapshotMock.mockResolvedValue(snapshot);

    const caller = appRouter.createCaller(createContext("admin"));
    const result = await caller.admin.snapshot();

    expect(getAdminSnapshotMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual(snapshot);
  });

  it("blocks non-admin users from accessing admin data", async () => {
    const caller = appRouter.createCaller(createContext("user"));

    await expect(caller.admin.users()).rejects.toMatchObject<Partial<TRPCError>>({
      code: "FORBIDDEN",
    });
    expect(getAdminUsersMock).not.toHaveBeenCalled();
  });

  it("blocks unauthenticated visitors from accessing admin data", async () => {
    const caller = appRouter.createCaller(createContext(null));

    await expect(caller.admin.dashboard()).rejects.toMatchObject<Partial<TRPCError>>({
      code: "FORBIDDEN",
    });
    expect(getAdminDashboardSummaryMock).not.toHaveBeenCalled();
  });
});
