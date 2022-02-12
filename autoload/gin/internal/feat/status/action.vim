function! gin#internal#feat#status#action#register() abort
  noremap <buffer> <Plug>(gin-action-open=)
        \ <Cmd>call gin#action#fn({ xs -> <SID>open({ -> <SID>opener() }, xs) })<CR>
  map <buffer> <Plug>(gin-action-open:edit) <Plug>(gin-action-open=)edit<CR>
  map <buffer> <Plug>(gin-action-open:split) <Plug>(gin-action-open=)split<CR>
  map <buffer> <Plug>(gin-action-open:vsplit) <Plug>(gin-action-open=)vsplit<CR>
  map <buffer> <Plug>(gin-action-open:tabedit) <Plug>(gin-action-open=)tabedit<CR>
  map <buffer> <Plug>(gin-action-open) <Plug>(gin-action-open:edit)

  noremap <buffer> <Plug>(gin-action-diff:local=)
        \ <Cmd>call gin#action#fn({ xs -> <SID>diff({ -> <SID>opener() }, '', xs) })<CR>
  noremap <buffer> <Plug>(gin-action-diff:cached=)
        \ <Cmd>call gin#action#fn({ xs -> <SID>diff({ -> <SID>opener() }, '--cached', xs) })<CR>
  noremap <buffer> <Plug>(gin-action-diff:HEAD=)
        \ <Cmd>call gin#action#fn({ xs -> <SID>diff({ -> <SID>opener() }, 'HEAD', xs) })<CR>
  noremap <buffer> <Plug>(gin-action-diff:smart=)
        \ <Cmd>call gin#action#fn({ xs -> <SID>diff_smart({ -> <SID>opener() }, xs) })<CR>
  map <buffer> <Plug>(gin-action-diff:local:edit) <Plug>(gin-action-diff:local=)edit<CR>
  map <buffer> <Plug>(gin-action-diff:local:split) <Plug>(gin-action-diff:local=)split<CR>
  map <buffer> <Plug>(gin-action-diff:local:vsplit) <Plug>(gin-action-diff:local=)vsplit<CR>
  map <buffer> <Plug>(gin-action-diff:local:tabedit) <Plug>(gin-action-diff:local=)tabedit<CR>
  map <buffer> <Plug>(gin-action-diff:local) <Plug>(gin-action-diff:local:edit)
  map <buffer> <Plug>(gin-action-diff:cached:edit) <Plug>(gin-action-diff:cached=)edit<CR>
  map <buffer> <Plug>(gin-action-diff:cached:split) <Plug>(gin-action-diff:cached=)split<CR>
  map <buffer> <Plug>(gin-action-diff:cached:vsplit) <Plug>(gin-action-diff:cached=)vsplit<CR>
  map <buffer> <Plug>(gin-action-diff:cached:tabedit) <Plug>(gin-action-diff:cached=)tabedit<CR>
  map <buffer> <Plug>(gin-action-diff:cached) <Plug>(gin-action-diff:cached:edit)
  map <buffer> <Plug>(gin-action-diff:HEAD:edit) <Plug>(gin-action-diff:HEAD=)edit<CR>
  map <buffer> <Plug>(gin-action-diff:HEAD:split) <Plug>(gin-action-diff:HEAD=)split<CR>
  map <buffer> <Plug>(gin-action-diff:HEAD:vsplit) <Plug>(gin-action-diff:HEAD=)vsplit<CR>
  map <buffer> <Plug>(gin-action-diff:HEAD:tabedit) <Plug>(gin-action-diff:HEAD=)tabedit<CR>
  map <buffer> <Plug>(gin-action-diff:HEAD) <Plug>(gin-action-diff:HEAD:edit)
  map <buffer> <Plug>(gin-action-diff:smart:edit) <Plug>(gin-action-diff:smart=)edit<CR>
  map <buffer> <Plug>(gin-action-diff:smart:split) <Plug>(gin-action-diff:smart=)split<CR>
  map <buffer> <Plug>(gin-action-diff:smart:vsplit) <Plug>(gin-action-diff:smart=)vsplit<CR>
  map <buffer> <Plug>(gin-action-diff:smart:tabedit) <Plug>(gin-action-diff:smart=)tabedit<CR>
  map <buffer> <Plug>(gin-action-diff:smart) <Plug>(gin-action-diff:smart:edit)
  map <buffer> <Plug>(gin-action-diff:edit) <Plug>(gin-action-diff:smart:edit)
  map <buffer> <Plug>(gin-action-diff:split) <Plug>(gin-action-diff:smart:split)
  map <buffer> <Plug>(gin-action-diff:vsplit) <Plug>(gin-action-diff:smart:vsplit)
  map <buffer> <Plug>(gin-action-diff:tabedit) <Plug>(gin-action-diff:smart:tabedit)
  map <buffer> <Plug>(gin-action-diff) <Plug>(gin-action-diff:smart)

  noremap <buffer> <Plug>(gin-action-add)
        \ <Cmd>call gin#action#fn({ xs -> <SID>add('', xs) })<CR>
  noremap <buffer> <Plug>(gin-action-add:intent-to-add)
        \ <Cmd>call gin#action#fn({ xs -> <SID>add('--intent-to-add', xs) })<CR>

  noremap <buffer> <Plug>(gin-action-rm)
        \ <Cmd>call gin#action#fn({ xs -> <SID>rm('', xs) })<CR>
  noremap <buffer> <Plug>(gin-action-rm:force)
        \ <Cmd>call gin#action#fn({ xs -> <SID>rm('--force', xs) })<CR>

  noremap <buffer> <Plug>(gin-action-reset)
        \ <Cmd>call gin#action#fn({ xs -> <SID>reset(xs) })<CR>

  noremap <buffer> <Plug>(gin-action-restore)
        \ <Cmd>call gin#action#fn({ xs -> <SID>restore('', xs) })<CR>
  noremap <buffer> <Plug>(gin-action-restore:staged)
        \ <Cmd>call gin#action#fn({ xs -> <SID>restore('--staged', xs) })<CR>
  noremap <buffer> <Plug>(gin-action-restore:ours)
        \ <Cmd>call gin#action#fn({ xs -> <SID>restore('--ours', xs) })<CR>
  noremap <buffer> <Plug>(gin-action-restore:theirs)
        \ <Cmd>call gin#action#fn({ xs -> <SID>restore('--theirs', xs) })<CR>

  noremap <buffer> <Plug>(gin-action-stage)
        \ <Cmd>call gin#action#fn({ xs -> <SID>stage(xs) })<CR>
  map <buffer> <Plug>(gin-action-unstage) <Plug>(gin-action-reset)

  noremap <buffer> <Plug>(gin-action-stage:intent-to-add)
        \ <Cmd>call gin#action#fn({ xs -> <SID>stage_intent_to_add(xs) })<CR>
  noremap <buffer> <Plug>(gin-action-unstage:intent-to-add)
        \ <Cmd>call gin#action#fn({ xs -> <SID>unstage_intent_to_add(xs) })<CR>
endfunction

function! s:norm_xs(xs) abort
  call map(a:xs, { _, v -> v.value })
  call map(a:xs, { _, v -> escape(v, ' \\') })
endfunction

function! s:opener() abort
  let opener = input('Open with: ')
  redraw | echo ''
  if empty(opener)
    echohl WarningMsg
    echo 'Cancelled'
    echohl None
    return v:null
  endif
  return opener
endfunction

function! s:open(opener, xs) abort
  let opener = a:opener()
  if opener is# v:null
    return
  endif
  call s:norm_xs(a:xs)
  call map(a:xs, { _, v -> execute(printf('%s %s', opener, v), '') })
endfunction

function! s:diff(opener, suffix, xs) abort
  let opener = a:opener()
  if opener is# v:null
    return
  endif
  call s:norm_xs(a:xs)
  call map(a:xs, { _, v -> execute(printf('%s | GinDiff %s %s', opener, a:suffix, v), '') })
endfunction

function! s:diff_smart(opener, xs) abort
  let opener = a:opener()
  if opener is# v:null
    return
  endif

  let xs_local = filter(copy(a:xs), { _, v -> v.XY[0] ==# '.' })
  if !empty(xs_local)
    call s:diff({ -> opener }, '', xs_local)
  endif

  let xs_cached = filter(copy(a:xs), { _, v -> v.XY[0] !=# '.' })
  if !empty(xs_cached)
    call s:diff({ -> opener }, '--cached', xs_cached)
  endif
endfunction

function! s:add(suffix, xs) abort
  call s:norm_xs(a:xs)
  execute printf('Gin! add --ignore-errors --force %s -- %s', a:suffix, join(a:xs, ' '))
endfunction

function! s:rm(suffix, xs) abort
  call s:norm_xs(a:xs)
  execute printf('Gin! rm --quiet --ignore-unmatch --cached %s -- %s', a:suffix, join(a:xs, ' '))
endfunction

function! s:reset(xs) abort
  call s:norm_xs(a:xs)
  execute printf('Gin! reset --quiet -- %s', join(a:xs, ' '))
endfunction

function! s:restore(suffix, xs) abort
  call s:norm_xs(a:xs)
  execute printf('Gin! restore --quiet --ignore-unmerged %s %s', a:suffix, join(a:xs, ' '))
endfunction

function! s:stage(xs) abort
  let xs_removed = filter(copy(a:xs), { _, v -> v.XY[1] ==# 'D' })
  if !empty(xs_removed)
    noautocmd call s:rm('', xs_removed)
  endif

  let xs_others = filter(a:xs, { _, v -> v.XY[1] !=# 'D' })
  if !empty(xs_others)
    noautocmd call s:add('', xs_others)
  endif

  doautocmd <nomodeline> User GinCommandPost
endfunction

function! s:stage_intent_to_add(xs) abort
  let xs_unknown = filter(copy(a:xs), { _, v -> v.XY ==# '??' })
  if !empty(xs_unknown)
    noautocmd call s:add('--intent-to-add', xs_unknown)
  endif

  let xs_removed = filter(copy(a:xs), { _, v -> v.XY[1] ==# 'D' })
  if !empty(xs_removed)
    noautocmd call s:rm('', xs_removed)
  endif

  let xs_others = filter(a:xs, { _, v -> v.XY !=# '??' && v.XY[1] !=# 'D' })
  if !empty(xs_others)
    noautocmd call s:add('', xs_others)
  endif

  doautocmd <nomodeline> User GinCommandPost
endfunction

function! s:unstage_intent_to_add(xs) abort
  let xs_added = filter(copy(a:xs), { _, v -> v.XY ==# 'A.' })
  if !empty(xs_added)
    noautocmd call s:reset(copy(xs_added))
    noautocmd call s:add('--intent-to-add', xs_added)
  endif

  let xs_others = filter(a:xs, { _, v -> v.XY !=# 'A.' })
  if !empty(xs_others)
    noautocmd call s:reset(xs_others)
  endif

  doautocmd <nomodeline> User GinCommandPost
endfunction
