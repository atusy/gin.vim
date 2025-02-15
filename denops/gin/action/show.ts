import type { Denops } from "https://deno.land/x/denops_std@v5.0.1/mod.ts";
import * as batch from "https://deno.land/x/denops_std@v5.0.1/batch/mod.ts";
import { alias, define, GatherCandidates, Range } from "./core.ts";
import { exec as execBuffer } from "../command/buffer/command.ts";

export type Candidate = { commit: string };

export async function init(
  denops: Denops,
  bufnr: number,
  gatherCandidates: GatherCandidates<Candidate>,
): Promise<void> {
  const openers = [
    "edit",
    "split",
    "vsplit",
    "tabedit",
  ];
  await batch.batch(denops, async (denops) => {
    for (const opener of openers) {
      await define(
        denops,
        bufnr,
        `show:${opener}`,
        (denops, bufnr, range) =>
          doShow(denops, bufnr, range, opener, false, gatherCandidates),
      );
      await define(
        denops,
        bufnr,
        `show:${opener}:emojify`,
        (denops, bufnr, range) =>
          doShow(denops, bufnr, range, opener, true, gatherCandidates),
      );
    }
    await alias(
      denops,
      bufnr,
      "show",
      "show:edit",
    );
    await alias(
      denops,
      bufnr,
      "show:emojify",
      "show:edit:emojify",
    );
  });
}

async function doShow(
  denops: Denops,
  bufnr: number,
  range: Range,
  opener: string,
  emojify: boolean,
  gatherCandidates: GatherCandidates<Candidate>,
): Promise<void> {
  const xs = await gatherCandidates(denops, bufnr, range);
  for (const x of xs) {
    await execBuffer(denops, ["show", x.commit], {
      opener,
      emojify,
    });
  }
}
