npx -y concurrently `
  -n "Auth,Dashboard,Client,Server,Operations" `
  -c "blue,green,magenta,yellow,cyan" `
  "cd f:\incridea-auth && npm run dev" `
  "cd f:\incridea-dashboard && npm run dev" `
  "cd f:\incridea-client-v2 && npm run dev" `
  "cd f:\incridea-server-v2 && npm run dev" `
  "cd f:\incridea-operations && npm run dev"
