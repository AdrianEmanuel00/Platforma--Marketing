"use client";
// Starea aplicației, salvată în browser (localStorage) până conectăm Supabase.
// Toate ecranele citesc și scriu prin acest store, deci mutarea pe baza de date
// înseamnă doar înlocuirea funcțiilor de aici cu apeluri la server.
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import * as seed from "./demo-data";
import * as biz from "./demo-business";
import type { AgentRun, Member, Platform, Post, Project, ResearchReport, Workspace } from "./types";

export interface AppState {
  version: 1;
  workspace: Workspace;
  members: Member[];
  projects: Project[];
  posts: Post[];
  reports: ResearchReport[];
  runs: AgentRun[];
}

/** Cele două conturi demo: o agenție cu mai mulți clienți și o afacere care își face singură social media. */
export type AccountId = "agency" | "business";
export const ACCOUNT_KEY = "platforma-marketing:account";
const storageKey = (a: AccountId) => (a === "agency" ? "platforma-marketing:v1" : "platforma-marketing:v1:business");

function seedState(account: AccountId): AppState {
  if (account === "business") {
    return {
      version: 1,
      workspace: biz.businessWorkspace,
      members: biz.businessMembers,
      projects: biz.businessProjects,
      posts: biz.businessPosts,
      reports: biz.businessReports,
      runs: biz.businessRuns,
    };
  }
  return {
    version: 1,
    workspace: { ...seed.workspace, name: "Agenția Nord Social" },
    members: seed.members,
    projects: seed.projects,
    posts: seed.posts,
    reports: seed.researchReports,
    runs: seed.agentRuns,
  };
}

export function readAccount(): AccountId | null {
  try {
    const a = localStorage.getItem(ACCOUNT_KEY);
    return a === "agency" || a === "business" ? a : null;
  } catch {
    return null;
  }
}

export function chooseAccount(a: AccountId | null) {
  try {
    if (a) localStorage.setItem(ACCOUNT_KEY, a);
    else localStorage.removeItem(ACCOUNT_KEY);
  } catch {
    // fără stocare, contul ține doar cât e deschisă pagina
  }
}

type Action =
  | { type: "load"; state: AppState }
  | { type: "reset"; account: AccountId }
  | { type: "updateWorkspace"; patch: Partial<Workspace> }
  | { type: "addProject"; project: Project }
  | { type: "updateProject"; id: string; patch: Partial<Project> }
  | { type: "deleteProject"; id: string }
  | { type: "toggleConnection"; projectId: string; platform: Platform }
  | { type: "addPost"; post: Post }
  | { type: "updatePost"; id: string; patch: Partial<Post> }
  | { type: "deletePost"; id: string }
  | { type: "addReport"; report: ResearchReport }
  | { type: "addRun"; run: AgentRun };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "load":
      return action.state;
    case "reset":
      return seedState(action.account);
    case "updateWorkspace":
      return { ...state, workspace: { ...state.workspace, ...action.patch } };
    case "addProject":
      return { ...state, projects: [...state.projects, action.project] };
    case "updateProject":
      return {
        ...state,
        projects: state.projects.map((p) => (p.id === action.id ? { ...p, ...action.patch } : p)),
      };
    case "deleteProject":
      return {
        ...state,
        projects: state.projects.filter((p) => p.id !== action.id),
        posts: state.posts.filter((p) => p.projectId !== action.id),
        reports: state.reports.filter((r) => r.projectId !== action.id),
        runs: state.runs.filter((r) => r.projectId !== action.id),
      };
    case "toggleConnection":
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id !== action.projectId
            ? p
            : {
                ...p,
                connected: p.connected.includes(action.platform)
                  ? p.connected.filter((x) => x !== action.platform)
                  : [...p.connected, action.platform],
              },
        ),
      };
    case "addPost":
      return { ...state, posts: [...state.posts, action.post] };
    case "updatePost":
      return { ...state, posts: state.posts.map((p) => (p.id === action.id ? { ...p, ...action.patch } : p)) };
    case "deletePost":
      return { ...state, posts: state.posts.filter((p) => p.id !== action.id) };
    case "addReport":
      return { ...state, reports: [action.report, ...state.reports] };
    case "addRun":
      return { ...state, runs: [action.run, ...state.runs].slice(0, 200) };
  }
}

interface StoreValue {
  state: AppState;
  hydrated: boolean;
  account: AccountId;
  dispatch: (a: Action) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children, onNoAccount }: { children: React.ReactNode; onNoAccount: () => void }) {
  const [state, dispatch] = useReducer(reducer, "agency" as AccountId, seedState);
  const [hydrated, setHydrated] = useState(false);
  const [account, setAccount] = useState<AccountId>("agency");

  // Citim localStorage doar după montare (serverul nu îl are), deci efectul e locul corect.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const acc = readAccount();
    if (!acc) {
      onNoAccount();
      return;
    }
    setAccount(acc);
    dispatch({ type: "load", state: seedState(acc) });
    try {
      const raw = localStorage.getItem(storageKey(acc));
      if (raw) {
        const saved = JSON.parse(raw) as AppState;
        if (saved?.version === 1 && Array.isArray(saved.projects)) dispatch({ type: "load", state: saved });
      }
    } catch {
      // Stocare indisponibilă (fereastră privată etc.): rămânem pe datele inițiale.
    }
    setHydrated(true);
  }, [onNoAccount]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey(account), JSON.stringify(state));
    } catch {
      // ignorăm: aplicația merge și fără salvare
    }
  }, [state, hydrated, account]);

  const value = useMemo(() => ({ state, hydrated, account, dispatch }), [state, hydrated, account]);
  if (!hydrated) return <div className="min-h-screen bg-background" />;
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore trebuie folosit în StoreProvider");
  return ctx;
}

export function useProject(slug: string | undefined) {
  const { state, hydrated } = useStore();
  const project = state.projects.find((p) => p.slug === slug);
  return { project, hydrated };
}

export function useProjectData(projectId: string | undefined) {
  const { state } = useStore();
  return useMemo(
    () => ({
      posts: state.posts.filter((p) => p.projectId === projectId),
      report: state.reports.find((r) => r.projectId === projectId),
      runs: state.runs.filter((r) => r.projectId === projectId),
    }),
    [state.posts, state.reports, state.runs, projectId],
  );
}

export function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

/** Înregistrează o rulare de agent, ca să apară în „Agenții lucrează”. */
export function useLogRun() {
  const { dispatch } = useStore();
  return useCallback(
    (run: Omit<AgentRun, "id" | "startedAt">) =>
      dispatch({ type: "addRun", run: { ...run, id: newId("run"), startedAt: new Date().toISOString() } }),
    [dispatch],
  );
}

export function slugify(name: string) {
  return (
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "client"
  );
}
