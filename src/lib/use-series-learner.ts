"use client";
import { useCallback } from "react";
import { dayKey } from "./format";
import { useLogRun, useStore } from "./store";
import type { ContentSeries, Post, Project } from "./types";

export function seriesPosts(posts: Post[], seriesId: string) {
  return posts
    .filter((p) => p.seriesId === seriesId)
    .sort((a, b) => (b.scheduledAt ?? "9999").localeCompare(a.scheduledAt ?? "9999"));
}

/** Contextul trimis copywriterului: cum arată seria și ultimele ei postări. */
export function seriesContext(series: ContentSeries, posts: Post[]) {
  return {
    name: series.name,
    description: series.description,
    visualGuide: series.visualGuide,
    learnings: series.learnings,
    recent: seriesPosts(posts, series.id)
      .slice(0, 6)
      .map((p) => ({ title: p.title, caption: p.variants[0]?.caption ?? "", visualPrompt: p.visualPrompt })),
  };
}

/** Rulează agentul seriei pe istoric și îi salvează ce a învățat. */
export function useSeriesLearner() {
  const { dispatch } = useStore();
  const logRun = useLogRun();
  return useCallback(
    async (project: Project, series: ContentSeries, posts: Post[]) => {
      const history = seriesPosts(posts, series.id).map((p) => ({
        title: p.title,
        status: p.status,
        date: p.scheduledAt ? dayKey(p.scheduledAt) : undefined,
        captions: p.variants.map((v) => `${v.platform}: ${v.caption}`),
        visualPrompt: p.visualPrompt,
        metrics: p.metrics,
      }));
      const res = await fetch("/api/agents/series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project,
          series: { name: series.name, description: series.description, visualGuide: series.visualGuide, learnings: series.learnings },
          history,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Agentul seriei a eșuat.");
      dispatch({
        type: "updateSeries",
        id: series.id,
        patch: {
          learnings: data.learnings,
          nextIdeas: data.nextIdeas,
          visualGuide: data.visualGuide || series.visualGuide,
          learnedAt: new Date().toISOString(),
        },
      });
      logRun({
        projectId: project.id,
        agent: "series",
        status: "succeeded",
        summary: `A învățat din ${history.length} postări ale seriei „${series.name}”`,
        costUsd: 0.05,
      });
    },
    [dispatch, logRun],
  );
}
