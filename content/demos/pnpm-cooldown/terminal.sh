$ pnpm -v
11.2.0
$ pnpm view <pkg> time --json | tail -3
  "3.4.1": "2026-10-20T09:12:44.120Z",
  "3.4.2": "2026-10-24T07:58:10.003Z"
}
$ pnpm add <pkg>@latest
 WARN  <pkg>@3.4.2 is 1 hour old;
       minimumReleaseAge is 1 day.
+ <pkg> 3.4.1
$ pnpm add <pkg>@latest \
  --config.minimumReleaseAge=0
+ <pkg> 3.4.2
