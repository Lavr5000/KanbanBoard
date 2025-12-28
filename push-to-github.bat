@echo off
echo Pushing to GitHub...
cd /d "c:\Users\user\.claude\0 ProEKTi\kanban-board2.0"
git add .
git commit -m "Add auto-fix ticket for Phase 3 bugs"
git push origin claude/setup-supabase-TUKCP
echo Done!
pause
