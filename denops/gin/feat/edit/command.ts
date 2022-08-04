import type { Denops } from "https://deno.land/x/denops_std@v3.7.1/mod.ts";
import * as autocmd from "https://deno.land/x/denops_std@v3.7.1/autocmd/mod.ts";
import * as batch from "https://deno.land/x/denops_std@v3.7.1/batch/mod.ts";
import {
  BufnameParams,
  format as formatBufname,
  parse as parseBufname,
} from "https://deno.land/x/denops_std@v3.7.1/bufname/mod.ts";
import * as fn from "https://deno.land/x/denops_std@v3.7.1/function/mod.ts";
import * as helper from "https://deno.land/x/denops_std@v3.7.1/helper/mod.ts";
import * as option from "https://deno.land/x/denops_std@v3.7.1/option/mod.ts";
import * as vars from "https://deno.land/x/denops_std@v3.7.1/variable/mod.ts";
import * as unknownutil from "https://deno.land/x/unknownutil@v2.0.0/mod.ts";
import * as fs from "https://deno.land/std@0.150.0/fs/mod.ts";
import * as path from "https://deno.land/std@0.150.0/path/mod.ts";
import {
  builtinOpts,
  formatOpts,
  parse,
  parseOpts,
  validateFlags,
  validateOpts,
} from "https://deno.land/x/denops_std@v3.7.1/argument/mod.ts";
import * as buffer from "https://deno.land/x/denops_std@v3.7.1/buffer/mod.ts";
import { expand, normCmdArgs } from "../../util/cmd.ts";
import {
  findWorktreeFromSuspects,
  listWorktreeSuspectsFromDenops,
} from "../../util/worktree.ts";
import { decodeUtf8 } from "../../util/text.ts";
import { run } from "../../git/process.ts";
import { exec as echoExec } from "../../core/echo/command.ts";

export type Options = {
  worktree?: string;
  cached?: boolean;
  opener?: string;
  cmdarg?: string;
  mods?: string;
};

export async function command(
  denops: Denops,
  mods: string,
  args: string[],
): Promise<void> {
  const [opts, flags, residue] = parse(await normCmdArgs(denops, args));
  validateOpts(opts, [
    "worktree",
    ...builtinOpts,
  ]);
  validateFlags(flags, [
    "cached",
  ]);
  const [commitish, abspath] = parseResidue(residue);
  const options = {
    worktree: opts["worktree"],
    cached: "cached" in flags,
    cmdarg: formatOpts(opts, builtinOpts).join(" "),
    mods,
  };
  await exec(denops, abspath, commitish, flags, options);
}

export async function exec(
  denops: Denops,
  filename: string,
  commitish: string | undefined,
  params: BufnameParams,
  options: Options = {},
): Promise<buffer.OpenResult> {
  const [verbose] = await batch.gather(
    denops,
    async (denops) => {
      await option.verbose.get(denops);
    },
  );
  unknownutil.assertNumber(verbose);

  const worktree = await findWorktreeFromSuspects(
    options.worktree
      ? [await expand(denops, options.worktree)]
      : await listWorktreeSuspectsFromDenops(denops, !!verbose),
    !!verbose,
  );
  const relpath = path.relative(worktree, filename);

  if (!commitish && !options.cached) {
    // worktree
    return await buffer.open(denops, path.join(worktree, relpath), {
      opener: options.opener,
      cmdarg: options.cmdarg,
      mods: options.mods,
    });
  } else {
    // commitish/cached
    const bufname = formatBufname({
      scheme: "ginedit",
      expr: worktree,
      params: {
        ...params,
        cached: undefined,
        commitish,
      },
      fragment: relpath,
    });
    return await buffer.open(denops, bufname.toString(), {
      opener: options.opener,
      cmdarg: options.cmdarg,
      mods: options.mods,
    });
  }
}

export async function read(
  denops: Denops,
  bufnr: number,
  bufname: string,
): Promise<void> {
  const [env, verbose, cmdarg] = await batch.gather(
    denops,
    async (denops) => {
      await fn.environ(denops);
      await option.verbose.get(denops);
      await vars.v.get(denops, "cmdarg");
    },
  ) as [Record<string, string>, number, string];
  const [opts, _] = parseOpts(cmdarg.split(" "));
  validateOpts(opts, builtinOpts);
  const { expr, params, fragment } = parseBufname(bufname);
  if (!fragment) {
    throw new Error("A buffer 'ginedit://' requires a fragment part");
  }
  const args = [
    "show",
    ...formatTreeish(params?.commitish, fragment),
  ];
  const proc = run(args, {
    printCommand: !!verbose,
    stdin: "null",
    stdout: "piped",
    stderr: "piped",
    noOptionalLocks: true,
    cwd: expr,
    env,
  });
  const [status, stdout, stderr] = await Promise.all([
    proc.status(),
    proc.output(),
    proc.stderrOutput(),
  ]);
  proc.close();
  if (!status.success) {
    throw new Error(decodeUtf8(stderr));
  }
  const { content, fileformat, fileencoding } = await buffer.decode(
    denops,
    bufnr,
    stdout,
    {
      fileformat: opts["ff"] ?? opts["fileformat"],
      fileencoding: opts["enc"] ?? opts["fileencoding"],
    },
  );
  await buffer.replace(denops, bufnr, content, {
    fileformat,
    fileencoding,
  });
  await buffer.concrete(denops, bufnr);
  await buffer.ensure(denops, bufnr, async () => {
    await batch.batch(denops, async (denops) => {
      await denops.cmd("filetype detect");
      await option.swapfile.setLocal(denops, false);
      await option.bufhidden.setLocal(denops, "unload");
      if (params?.commitish) {
        await option.buftype.setLocal(denops, "nowrite");
      } else {
        await option.buftype.setLocal(denops, "acwrite");
        await autocmd.group(denops, "gitedit_read_internal", (helper) => {
          helper.remove("*", "<buffer>");
          helper.define(
            "BufWriteCmd",
            "<buffer>",
            `call denops#request('gin', 'edit:write', [bufnr(), expand('<amatch>')])`,
            {
              nested: true,
            },
          );
        });
      }
    });
  });
}

export async function write(
  denops: Denops,
  bufnr: number,
  bufname: string,
): Promise<void> {
  const content = await fn.getline(denops, 1, "$");
  const { expr, fragment } = parseBufname(bufname);
  if (!fragment) {
    throw new Error("A buffer 'ginedit://' requires a fragment part");
  }
  const original = path.join(expr, fragment);
  let restore: () => Promise<void>;
  const f = await Deno.makeTempFile({
    dir: path.dirname(original),
  });
  try {
    await Deno.rename(original, f);
    restore = () => Deno.rename(f, original);
  } catch (e) {
    if (!(e instanceof Deno.errors.NotFound)) {
      throw e;
    }
    await Deno.remove(f);
    restore = () => Deno.remove(original);
  }
  try {
    await fs.ensureFile(original);
    await Deno.writeTextFile(original, `${content.join("\n")}\n`);
    await echoExec(denops, [
      "add",
      "--force",
      "--",
      fragment,
    ], {
      worktree: expr,
    });
    await fn.setbufvar(denops, bufnr, "&modified", 0);
    await helper.echo(denops, `[gin] INDEX of '${fragment}' is updated.`);
  } finally {
    await restore();
  }
}

function parseResidue(
  residue: string[],
): [string | undefined, string] {
  // GinEdit [{options}] {path}
  // GinEdit [{options}] --cached {path}
  // GinEdit [{options}] {commitish} {path}
  switch (residue.length) {
    case 1:
      return [undefined, residue[0].toString()];
    case 2:
      return [residue[0].toString(), residue[1].toString()];
    default:
      throw new Error("Invalid number of arguments");
  }
}

function formatTreeish(
  commitish: string | string[] | undefined,
  relpath: string,
): [] | [string] {
  if (commitish) {
    unknownutil.assertString(commitish);
    return [`${commitish}:${relpath}`];
  } else {
    return [`:${relpath}`];
  }
}
