import type { Denops } from "https://deno.land/x/denops_std@v5.0.1/mod.ts";
import * as batch from "https://deno.land/x/denops_std@v5.0.1/batch/mod.ts";
import { define, GatherCandidates, Range } from "./core.ts";
import { exec as execBare } from "../command/bare/command.ts";

export type Candidate =
  | { kind: "remote"; branch: string; remote: string }
  | { kind?: "alias" | "local"; branch: string };

export async function init(
  denops: Denops,
  bufnr: number,
  gatherCandidates: GatherCandidates<Candidate>,
): Promise<void> {
  await batch.batch(denops, async (denops) => {
    await define(
      denops,
      bufnr,
      "delete",
      (denops, bufnr, range) =>
        doDelete(denops, bufnr, range, false, gatherCandidates),
    );
    await define(
      denops,
      bufnr,
      "delete:force",
      (denops, bufnr, range) =>
        doDelete(denops, bufnr, range, true, gatherCandidates),
    );
  });
}

async function doDelete(
  denops: Denops,
  bufnr: number,
  range: Range,
  force: boolean,
  gatherCandidates: GatherCandidates<Candidate>,
): Promise<void> {
  const xs = await gatherCandidates(denops, bufnr, range);
  for (const x of xs) {
    switch (x.kind) {
      case "alias":
        continue;
      case "remote":
        await execBare(denops, [
          "push",
          "--delete",
          x.remote,
          x.branch,
        ]);
        break;
      default:
        await execBare(denops, [
          "branch",
          force ? "-D" : "-d",
          x.branch,
        ]);
        break;
    }
  }
}
