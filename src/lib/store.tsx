"use client";
// Starea aplicației, salvată în browser (localStorage) până conectăm Supabase.
// Toate ecranele citesc și scriu prin acest store, deci mutarea pe baza de date
// înseamnă doar înlocuirea funcțiilor de aici cu apeluri la server.
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import * as seed from "./demo-data";
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

const STORAGE_KEY = "platforma-marketing:v1";

function seedState(): AppState {
  return {
    version: 1,
    workspace: seed.workspace,
    members: seed.members,
    projects: seed.projects,
    posts: seed.posts,
    reports: seed.researchReports,
    runs: seed.agentRuns,
  };
}

type Action =
  | { type: "load"; state: AppState }
  | { type: "reset" }
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
      return seedState();
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
  dispatch: (a: Action) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, seedState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as AppState;
        if (saved?.version === 1 && Array.isArray(saved.projects)) dispatch({ type: "load", state: saved });
      }
    } catch {
      // Stocare indisponibilă (fereastră privată etc.): rămânem pe datele inițiale.
    }
    // Citim localStorage doar după montare (serverul nu îl are), deci aici e locul corect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignorăm: aplicația merge și fără salvare
    }
  }, [state, hydrated]);

  const value = useMemo(() => ({ state, hydrated, dispatch }), [state, hydrated]);
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
