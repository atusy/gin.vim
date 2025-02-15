import type { Denops } from "https://deno.land/x/denops_std@v5.0.1/mod.ts";
import * as batch from "https://deno.land/x/denops_std@v5.0.1/batch/mod.ts";
import { alias, define, GatherCandidates, Range } from "./core.ts";
import { exec as execDiff } from "../command/diff/command.ts";

export type Candidate = { path: string; XY: string };

export async function init(
  denops: Denops,
  bufnr: number,
  gatherCandidates: GatherCandidates<Candidate>,
): Promise<void> {
  await batch.batch(denops, async (denops) => {
    const openers = [
      "edit",
      "split",
      "vsplit",
      "tabedit",
    ];
    for (const opener of openers) {
      await define(
        denops,
        bufnr,
        `diff:smart:${opener}`,
        (denops, bufnr, range) =>
          doDiffSmart(denops, bufnr, range, opener, gatherCandidates),
      );
    }
    await alias(
      denops,
      bufnr,
      "diff:smart",
      "diff:smart:edit",
    );
    await alias(
      denops,
      bufnr,
      "diff",
      "diff:smart",
    );
  });
}

async function doDiffSmart(
  denops: Denops,
  bufnr: number,
  range: Range,
  opener: string,
  gatherCandidates: GatherCandidates<Candidate>,
): Promise<void> {
  const xs = await gatherCandidates(denops, bufnr, range);
  for (const x of xs) {
    if (x.XY.startsWith(".")) {
      await execDiff(denops, {
        opener,
        paths: [x.path],
      });
    } else {
      await execDiff(denops, {
        opener,
        paths: [x.path],
        flags: {
          "cached": "",
        },
      });
    }
  }
}
