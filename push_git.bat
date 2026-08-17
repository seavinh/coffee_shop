@echo off
cd /d "d:\Bro Ya\Frontend"
git init
git add .
git commit -m "Initial commit: Angular 18.2+ Coffee Shop with Supabase Backend"
git remote remove origin
git remote add origin https://github.com/seavinh/coffee_shop.git
git branch -M main
git push -u origin main
