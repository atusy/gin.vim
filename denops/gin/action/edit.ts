import type { Denops } from "jsr:@denops/std@^7.0.0";
import * as batch from "jsr:@denops/std@^7.0.0/batch";
import * as buffer from "jsr:@denops/std@^7.0.0/buffer";
import { alias, define, GatherCandidates, Range } from "./core.ts";

export type Candidate = { path: string };

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
        `edit:local:${opener}`,
        (denops, bufnr, range) =>
          doEditLocal(denops, bufnr, range, opener, gatherCandidates),
      );
      await define(
        denops,
        bufnr,
        `edit:cached:${opener}`,
        (denops, bufnr, range) =>
          doEdit(denops, bufnr, range, opener, [], gatherCandidates),
      );
      await define(
        denops,
        bufnr,
        `edit:HEAD:${opener}`,
        (denops, bufnr, range) =>
          doEdit(
            denops,
            bufnr,
            range,
            opener,
            ["HEAD"],
            gatherCandidates,
          ),
      );
    }
    await alias(
      denops,
      bufnr,
      "edit:local",
      "edit:local:edit",
    );
    await alias(
      denops,
      bufnr,
      "edit:cached",
      "edit:cached:edit",
    );
    await alias(
      denops,
      bufnr,
      "edit:HEAD",
      "edit:HEAD:edit",
    );
    await alias(
      denops,
      bufnr,
      "edit",
      "edit:local",
    );
  });
}

async function doEdit(
  denops: Denops,
  bufnr: number,
  range: Range,
  opener: string,
  extraArgs: string[],
  gatherCandidates: GatherCandidates<Candidate>,
): Promise<void> {
  const xs = await gatherCandidates(denops, bufnr, range);
  for (const x of xs) {
    await denops.dispatch("gin", "edit:command", "", "", [
      `++opener=${opener}`,
      ...extraArgs,
      x.path,
    ]);
  }
}

async function doEditLocal(
  denops: Denops,
  bufnr: number,
  range: Range,
  opener: string,
  gatherCandidates: GatherCandidates<Candidate>,
): Promise<void> {
  const xs = await gatherCandidates(denops, bufnr, range);
  for (const x of xs) {
    await buffer.open(denops, x.path, {
      opener: opener,
    });
  }
}
