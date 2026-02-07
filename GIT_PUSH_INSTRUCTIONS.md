# How to Push Uncommitted Code to a New Branch

## Step-by-Step Instructions

### Option 1: Create a New Branch and Push (RECOMMENDED)

This is the safest approach as it preserves your current work and creates a new branch.

#### Step 1: Check Current Status
```bash
git status
```
This shows all uncommitted changes.

#### Step 2: Create a New Branch
```bash
git checkout -b supabase-migration-complete
```
This creates a new branch named `supabase-migration-complete` and switches to it.

#### Step 3: Stage All Changes
```bash
git add .
```
This stages all modified and new files.

#### Step 4: Commit Changes
```bash
git commit -m "feat: Complete MongoDB to Supabase migration - Phase 2 & 3

- Migrated 15+ API routes to use Supabase
- Removed MongoDB models and dependencies
- Updated all user ID references from ObjectId to UUID
- Converted field names to snake_case
- Fixed booking details page provider_id access
- Removed mongoose and @types/mongoose from package.json
- All routes now exclusively use Supabase client"
```

#### Step 5: Push to Remote
```bash
git push -u origin supabase-migration-complete
```
The `-u` flag sets the upstream branch, so future pushes only need `git push`.

---

### Option 2: Push to Existing Branch

If you want to push to an existing branch (like `main` or `develop`):

```bash
# Stage all changes
git add .

# Commit
git commit -m "feat: Complete MongoDB to Supabase migration"

# Push to current branch
git push
```

---

### Option 3: Stash, Switch Branch, and Reapply

If you want to keep your current branch clean:

```bash
# Stash changes
git stash

# Create and switch to new branch
git checkout -b supabase-migration-complete

# Apply stashed changes
git stash pop

# Stage and commit
git add .
git commit -m "feat: Complete MongoDB to Supabase migration"

# Push
git push -u origin supabase-migration-complete
```

---

## Recommended Workflow

### For This Migration:

```bash
# 1. Check what you're about to commit
git status

# 2. Create new branch
git checkout -b feat/supabase-migration-complete

# 3. Stage all changes
git add .

# 4. Review changes before committing
git diff --cached

# 5. Commit with descriptive message
git commit -m "feat: Complete MongoDB to Supabase migration

BREAKING CHANGE: MongoDB has been completely removed

- Migrated all 15+ API routes to Supabase
- Removed 6 MongoDB models (User, Service, Booking, Review, Conversation, Message)
- Removed MongoDB connection files (db.ts, dbConnect.ts)
- Updated package.json: removed mongoose and @types/mongoose
- Changed user ID format from ObjectId to UUID
- Converted all field names to snake_case
- Fixed booking details page provider_id access error
- All routes now use getSupabaseAdmin() client

Closes #migration-mongodb-to-supabase"

# 6. Push to remote
git push -u origin feat/supabase-migration-complete

# 7. Create Pull Request on GitHub/GitLab
# Go to your repository and create a PR from the new branch
```

---

## Verifying Your Push

After pushing, verify with:

```bash
# List all branches
git branch -a

# Check remote branches
git branch -r

# View commit history
git log --oneline -5

# View commits on new branch
git log origin/supabase-migration-complete --oneline
```

---

## If You Need to Undo

### Undo Last Commit (Keep Changes)
```bash
git reset --soft HEAD~1
```

### Undo Last Commit (Discard Changes)
```bash
git reset --hard HEAD~1
```

### Undo Push to Remote
```bash
git push origin HEAD --force
```
⚠️ **Use with caution!** Only if you haven't shared the branch yet.

---

## Branch Naming Conventions

Good branch names for this migration:
- `feat/supabase-migration-complete`
- `supabase-migration-phase-2-3`
- `mongodb-to-supabase-final`
- `chore/remove-mongodb-dependencies`

Avoid:
- `update`, `fix`, `changes` (too vague)
- `test`, `temp` (implies temporary)

---

## Creating a Pull Request

After pushing, create a PR with:

**Title:**
```
feat: Complete MongoDB to Supabase migration
```

**Description:**
```markdown
## Summary
Complete migration from MongoDB to Supabase, removing all MongoDB dependencies and models.

## Changes
- Migrated 15+ API routes to use Supabase
- Removed 6 MongoDB models
- Updated package.json to remove mongoose
- Fixed booking details page bug
- All user IDs now use UUID format

## Testing
- [ ] Test phone authentication
- [ ] Test email authentication (legacy)
- [ ] Test service operations
- [ ] Test booking operations
- [ ] Test messaging
- [ ] Verify no MongoDB errors

## Type of Change
- [x] Breaking change (MongoDB removed)
- [x] New feature (Supabase integration)
- [x] Bug fix
- [x] Dependency update

## Checklist
- [x] Code follows style guidelines
- [x] No MongoDB imports remain
- [x] All tests pass
- [x] Documentation updated
```

---

## Quick Reference

```bash
# One-liner to create branch, stage, commit, and push
git checkout -b supabase-migration-complete && git add . && git commit -m "feat: Complete MongoDB to Supabase migration" && git push -u origin supabase-migration-complete
```

---

## Troubleshooting

### "fatal: The current branch has no upstream branch"
```bash
git push -u origin <branch-name>
```

### "Permission denied (publickey)"
```bash
# Check SSH key
ssh -T git@github.com

# Or use HTTPS instead of SSH
git remote set-url origin https://github.com/username/repo.git
```

### "Your branch is ahead of 'origin/main' by X commits"
This is normal. Just push:
```bash
git push
```

### "Merge conflict"
```bash
# Resolve conflicts in your editor, then:
git add .
git commit -m "Resolve merge conflicts"
git push
```

---

## After Successful Push

1. ✅ Verify branch appears on GitHub/GitLab
2. ✅ Create Pull Request for code review
3. ✅ Run CI/CD checks
4. ✅ Get approvals
5. ✅ Merge to main branch
6. ✅ Delete feature branch (optional)

```bash
# Delete local branch after merge
git branch -d supabase-migration-complete

# Delete remote branch
git push origin --delete supabase-migration-complete
```
