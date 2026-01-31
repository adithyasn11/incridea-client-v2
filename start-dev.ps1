npx -y concurrently `
  -n "Auth,Dashboard,Client,Server,Operations" `
  -c "blue,green,magenta,yellow,cyan" `
  "cd ..\incridea-auth && npm run dev" `
  "cd ..\incridea-dashboard && npm run dev" `
  "cd . && npm run dev" `
  "cd ..\incridea-server-v2 && npm run dev" `
  "cd ..\incridea-operations && npm run dev"
