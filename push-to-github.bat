@echo off
echo Pushing to GitHub...
cd /d "c:\Users\user\.claude\0 ProEKTi\kanban-board2.0"

echo Checking current branch...
git checkout claude/setup-supabase-TUKCP

echo Adding changes...
git add .

echo Committing...
git commit -m "Add auto-fix ticket for Phase 3 bugs"

echo Pushing to GitHub...
git push origin claude/setup-supabase-TUKCP

echo Done!
pause
