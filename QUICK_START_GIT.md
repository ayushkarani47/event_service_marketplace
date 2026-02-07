# Quick Start: Push Your Changes to Git

## TL;DR - Just Run These Commands

Open your terminal/PowerShell and run these commands in order:

```powershell
# 1. Navigate to your project
cd "c:\Users\AYUSH\Web Projects\event_service_marketplace\event_service_marketplace"

# 2. Check what you're about to commit
git status

# 3. Create a new branch
git checkout -b supabase-migration-complete

# 4. Stage all changes
git add .

# 5. Commit your changes
git commit -m "feat: Complete MongoDB to Supabase migration - Phase 2 & 3

- Migrated 15+ API routes to Supabase
- Removed MongoDB models and dependencies
- Updated all user ID references to UUID format
- Converted field names to snake_case
- Fixed booking details page bug
- Removed mongoose from package.json"

# 6. Push to GitHub
git push -u origin supabase-migration-complete
```

---

## What These Commands Do

| Command | What It Does |
|---------|-------------|
| `git status` | Shows all your uncommitted changes |
| `git checkout -b supabase-migration-complete` | Creates a new branch named `supabase-migration-complete` |
| `git add .` | Stages all modified files for commit |
| `git commit -m "..."` | Creates a commit with your message |
| `git push -u origin supabase-migration-complete` | Pushes your branch to GitHub |

---

## After Pushing

1. **Go to GitHub** → Your repository
2. **Look for a notification** about your new branch
3. **Click "Compare & pull request"**
4. **Add a description** and **Create Pull Request**
5. **Wait for code review** and **Merge when approved**

---

## If Something Goes Wrong

### "I made a mistake in the commit message"
```powershell
git commit --amend -m "New message here"
git push -u origin supabase-migration-complete
```

### "I want to undo the last commit"
```powershell
git reset --soft HEAD~1
git status  # See your changes are still there
```

### "I pushed to the wrong branch"
```powershell
# Create the correct branch
git checkout -b supabase-migration-complete

# Push to the correct branch
git push -u origin supabase-migration-complete
```

---

## Verify Everything Worked

```powershell
# Check your branch exists locally
git branch

# Check your branch exists on GitHub
git branch -r

# See your commits
git log --oneline -5
```

---

## Files Changed in This Migration

### Modified Files (20+):
- 10 API route files
- 1 review service file
- 1 booking details page
- 1 package.json

### Removed Files:
- 6 MongoDB model files
- 2 MongoDB connection files

### Created Files:
- MIGRATION_COMPLETE.md (documentation)
- GIT_PUSH_INSTRUCTIONS.md (this guide)

---

## Branch Naming Explanation

**Branch Name:** `supabase-migration-complete`

- `supabase-migration` = What the branch is about
- `complete` = Status (complete, in-progress, etc.)

This follows the convention: `feature/description` or `feat/description`

---

## Commit Message Breakdown

```
feat: Complete MongoDB to Supabase migration - Phase 2 & 3
^    ^
|    └─ What you did
└────── Type of change (feat, fix, chore, docs, etc.)

- Migrated 15+ API routes to Supabase
- Removed MongoDB models and dependencies
...
└─ Details of what changed
```

---

## Next Steps After Merge

1. **Delete the feature branch** (optional but recommended)
   ```powershell
   git branch -d supabase-migration-complete
   git push origin --delete supabase-migration-complete
   ```

2. **Update your local main branch**
   ```powershell
   git checkout main
   git pull origin main
   ```

3. **Test the merged code**
   ```powershell
   npm install
   npm run dev
   ```

4. **Deploy to production** (when ready)

---

## Common Issues & Solutions

### Issue: "fatal: 'origin' does not appear to be a 'git' repository"
**Solution:** Make sure you're in the correct directory
```powershell
cd "c:\Users\AYUSH\Web Projects\event_service_marketplace\event_service_marketplace"
git status
```

### Issue: "Permission denied (publickey)"
**Solution:** Your SSH key isn't set up. Use HTTPS instead:
```powershell
git remote set-url origin https://github.com/yourusername/yourrepo.git
```

### Issue: "Your branch has diverged"
**Solution:** Pull the latest changes first
```powershell
git pull origin main
git push
```

### Issue: "Merge conflict"
**Solution:** 
1. Open the conflicted files in your editor
2. Resolve the conflicts (keep the Supabase code)
3. Run:
   ```powershell
   git add .
   git commit -m "Resolve merge conflicts"
   git push
   ```

---

## PowerShell Specific Tips

### If you get an execution policy error:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### To make git commands easier, create an alias:
```powershell
# Add to your PowerShell profile
Set-Alias -Name gs -Value "git status"
Set-Alias -Name ga -Value "git add"
Set-Alias -Name gc -Value "git commit"
Set-Alias -Name gp -Value "git push"
```

---

## Verification Checklist

Before pushing, verify:
- [ ] `git status` shows your changes
- [ ] `git diff` shows the correct code changes
- [ ] No MongoDB imports remain in the code
- [ ] package.json no longer has mongoose
- [ ] All API routes use Supabase

---

## Support

If you get stuck:
1. Check `GIT_PUSH_INSTRUCTIONS.md` for detailed help
2. Check `MIGRATION_COMPLETE.md` for what was changed
3. Run `git status` to see current state
4. Run `git log --oneline -5` to see recent commits

---

**You've got this! 🚀**
