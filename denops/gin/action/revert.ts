import type { Denops } from "jsr:@denops/std@^7.0.0";
import * as batch from "jsr:@denops/std@^7.0.0/batch";
import { define, GatherCandidates, Range } from "./core.ts";

export type Candidate = { commit: string };

export async function init(
  denops: Denops,
  bufnr: number,
  gatherCandidates: GatherCandidates<Candidate>,
): Promise<void> {
  await batch.batch(denops, async (denops) => {
    await define(
      denops,
      bufnr,
      `revert`,
      (denops, bufnr, range) =>
        doRevert(denops, bufnr, range, "", gatherCandidates),
    );
    await define(
      denops,
      bufnr,
      `revert:1`,
      (denops, bufnr, range) =>
        doRevert(denops, bufnr, range, "1", gatherCandidates),
    );
    await define(
      denops,
      bufnr,
      `revert:2`,
      (denops, bufnr, range) =>
        doRevert(denops, bufnr, range, "2", gatherCandidates),
    );
  });
}

async function doRevert(
  denops: Denops,
  bufnr: number,
  range: Range,
  mainline: "" | "1" | "2",
  gatherCandidates: GatherCandidates<Candidate>,
): Promise<void> {
  const xs = await gatherCandidates(denops, bufnr, range);
  const x = xs.at(0);
  if (!x) {
    return;
  }
  await denops.dispatch("gin", "command", "", [
    "revert",
    ...(mainline ? [] : ["--mainline", mainline]),
    x.commit,
  ]);
}
