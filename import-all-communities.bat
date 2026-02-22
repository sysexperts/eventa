@echo off
echo ========================================
echo Importing Artists for All Communities
echo ========================================
echo.

echo [1/8] Importing Turkish artists...
docker compose exec -e SPOTIFY_CLIENT_ID=5109167b84ae4bbeb7d3f27d9ad1217b -e SPOTIFY_CLIENT_SECRET=7b9dbfb345c84425826718cb67f84512 backend npx tsx scripts/import-spotify-artists.ts --query "turkish music" --limit 100
echo.

echo [2/8] Importing Greek artists...
docker compose exec -e SPOTIFY_CLIENT_ID=5109167b84ae4bbeb7d3f27d9ad1217b -e SPOTIFY_CLIENT_SECRET=7b9dbfb345c84425826718cb67f84512 backend npx tsx scripts/import-spotify-artists.ts --query "greek music" --limit 100
echo.

echo [3/8] Importing Arabic artists...
docker compose exec -e SPOTIFY_CLIENT_ID=5109167b84ae4bbeb7d3f27d9ad1217b -e SPOTIFY_CLIENT_SECRET=7b9dbfb345c84425826718cb67f84512 backend npx tsx scripts/import-spotify-artists.ts --query "arabic music" --limit 100
echo.

echo [4/8] Importing Polish artists...
docker compose exec -e SPOTIFY_CLIENT_ID=5109167b84ae4bbeb7d3f27d9ad1217b -e SPOTIFY_CLIENT_SECRET=7b9dbfb345c84425826718cb67f84512 backend npx tsx scripts/import-spotify-artists.ts --query "polish music" --limit 100
echo.

echo [5/8] Importing Balkan artists...
docker compose exec -e SPOTIFY_CLIENT_ID=5109167b84ae4bbeb7d3f27d9ad1217b -e SPOTIFY_CLIENT_SECRET=7b9dbfb345c84425826718cb67f84512 backend npx tsx scripts/import-spotify-artists.ts --query "balkan music" --limit 100
echo.

echo [6/8] Importing Russian artists...
docker compose exec -e SPOTIFY_CLIENT_ID=5109167b84ae4bbeb7d3f27d9ad1217b -e SPOTIFY_CLIENT_SECRET=7b9dbfb345c84425826718cb67f84512 backend npx tsx scripts/import-spotify-artists.ts --query "russian music" --limit 100
echo.

echo [7/8] Importing Italian artists...
docker compose exec -e SPOTIFY_CLIENT_ID=5109167b84ae4bbeb7d3f27d9ad1217b -e SPOTIFY_CLIENT_SECRET=7b9dbfb345c84425826718cb67f84512 backend npx tsx scripts/import-spotify-artists.ts --query "italian music" --limit 100
echo.

echo [8/8] Importing Spanish artists...
docker compose exec -e SPOTIFY_CLIENT_ID=5109167b84ae4bbeb7d3f27d9ad1217b -e SPOTIFY_CLIENT_SECRET=7b9dbfb345c84425826718cb67f84512 backend npx tsx scripts/import-spotify-artists.ts --query "spanish music" --limit 100
echo.

echo ========================================
echo Import Complete!
echo ========================================
pause
