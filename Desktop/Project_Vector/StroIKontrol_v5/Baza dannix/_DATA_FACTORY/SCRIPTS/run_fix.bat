@echo off
chcp 65001 >nul
powershell -ExecutionPolicy Bypass -Command "& { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8; & '_DATA_FACTORY\SCRIPTS\fix_database.ps1' }"
pause