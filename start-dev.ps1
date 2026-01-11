npx -y concurrently `
  -n "Auth,Dashboard,Client,Server" `
  -c "blue,green,magenta,yellow" `
  "cd f:\incridea-auth && npm run dev" `
  "cd f:\incridea-dashboard && npm run dev" `
  "cd f:\incridea-client-v2 && npm run dev" `
  "cd f:\incridea-server-v2 && npm run dev"
