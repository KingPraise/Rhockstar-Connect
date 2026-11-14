# Prompt to paste into Antigravity on the personal laptop

Open https://github.com/KingPraise/Rhockstar-Connect/blob/main/docs/handoff/SETUP_PROMPT.md in a browser,
then copy everything inside the box below into a new Antigravity conversation.

```text
I'm moving my Rhockstar Connect project back to this laptop from my work laptop. Set it up for me step by step. Stop and ask me whenever something is ambiguous, fails, or needs a password or login. Never guess secrets.

GitHub repo (PUBLIC): https://github.com/KingPraise/Rhockstar-Connect  (branch main, commit 75ee048 or newer)
The handoff notes are in the repo at docs/handoff/HANDOFF.md. Read them first.

1. Check whether an old copy of the project already exists on this laptop (probably %USERPROFILE%\Documents\Rhockstar-Connect).
   - If it exists: run `git status`, `git stash list` and `git log --branches --not --remotes --oneline`. Show me any uncommitted, stashed or unpushed work BEFORE changing anything, and don't discard anything without my approval. If there is an existing .env.local, back it up as .env.local.old-laptop-backup. Then `git fetch --all --prune`, switch to main, and `git pull`.
   - If it doesn't exist: clone the repo into %USERPROFILE%\Documents\Rhockstar-Connect.
2. Check that git has my name and email and that I can pull and push. If authentication fails, tell me what to do; don't change credentials yourself.
3. Check the Node version (netlify.toml expects Node 22). If it's different, tell me how to install Node 22 before going further.
4. Rebuild .env.local by following section 2 of docs/handoff/HANDOFF.md:
   - If an old-laptop backup exists, reuse any values from it that are still valid, and tell me which keys are missing or might be outdated (the Cloudinary secret is being rotated).
   - For every missing value, tell me exactly where to copy it from (mainly Netlify > Site configuration > Environment variables) and let me paste it to you. Write the file yourself so the formatting is right (FIREBASE_PRIVATE_KEY in double quotes with \n sequences).
   - Confirm .env.local is gitignored. Never commit it, and never print secret values back in full.
5. Run `npm install`.
6. Verify the setup using the rules in AGENTS.md: `npx tsc --noEmit`, `npm run test:auth` (all 5 probes must pass), `npm run build` (must exit 0). Also confirm that src/lib/firebase.ts is NOT falling back to its "dummy" values (all NEXT_PUBLIC_FIREBASE_* keys must be set). Start `npm run dev` and have me log in once at http://localhost:3000 to prove auth works.
7. Read section 4 "OPEN ITEMS" in HANDOFF.md and the files in docs/handoff/artifacts/, then give me a short summary of where the project stands and what to do next. Don't start fixing anything until I say so.
```
