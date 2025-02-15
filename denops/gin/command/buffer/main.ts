import type { Denops } from "https://deno.land/x/denops_std@v5.0.1/mod.ts";
import { unnullish } from "https://deno.land/x/unnullish@v1.0.1/unnullish.ts";
import { assert, is } from "https://deno.land/x/unknownutil@v3.0.0/mod.ts#^";
import * as helper from "https://deno.land/x/denops_std@v5.0.1/helper/mod.ts";
import * as buffer from "https://deno.land/x/denops_std@v5.0.1/buffer/mod.ts";
import {
  builtinOpts,
  formatOpts,
  parseOpts,
  validateOpts,
} from "https://deno.land/x/denops_std@v5.0.1/argument/opts.ts";

import { normCmdArgs, parseSilent } from "../../util/cmd.ts";
import { exec } from "./command.ts";
import { edit } from "./edit.ts";
import { read } from "./read.ts";

export function main(denops: Denops): void {
  denops.dispatcher = {
    ...denops.dispatcher,
    "buffer:command": (bang, mods, args) => {
      assert(bang, is.String, { message: "bang must be string" });
      assert(mods, is.String, { message: "mods must be string" });
      assert(args, is.ArrayOf(is.String), { message: "args must be string[]" });
      const silent = parseSilent(mods);
      return helper.ensureSilent(denops, silent, () => {
        return helper.friendlyCall(
          denops,
          () => command(denops, bang, mods, args),
        );
      });
    },
    "buffer:edit": (bufnr, bufname) => {
      assert(bufnr, is.Number, { message: "bufnr must be number" });
      assert(bufname, is.String, { message: "bufname must be string" });
      return helper.friendlyCall(
        denops,
        () => edit(denops, bufnr, bufname),
      );
    },
    "buffer:read": (bufnr, bufname) => {
      assert(bufnr, is.Number, { message: "bufnr must be number" });
      assert(bufname, is.String, { message: "bufname must be string" });
      return helper.friendlyCall(
        denops,
        () => read(denops, bufnr, bufname),
      );
    },
  };
}

async function command(
  denops: Denops,
  bang: string,
  mods: string,
  args: string[],
): Promise<buffer.OpenResult> {
  const [opts, residue] = parseOpts(await normCmdArgs(denops, args));
  validateOpts(opts, [
    "processor",
    "worktree",
    "monochrome",
    "opener",
    "emojify",
    ...builtinOpts,
  ]);
  return exec(denops, residue, {
    processor: opts.processor?.split(" "),
    worktree: opts.worktree,
    monochrome: unnullish(opts.monochrome, () => true),
    opener: opts.opener,
    emojify: unnullish(opts.emojify, () => true),
    cmdarg: formatOpts(opts, builtinOpts).join(" "),
    mods,
    bang: bang === "!",
  });
}
