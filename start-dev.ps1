npx -y concurrently `
  -n "Auth,Dashboard,Client,Server,Operations" `
  -c "blue,green,magenta,yellow,cyan" `
  "cd d:\\incridea-auth && npm i && npm run dev" `
  "cd d:\\incridea-dashboard && npm i && npm run dev" `
  "cd d:\\incridea-client-v2 && npm i && npm run dev" `
  "cd d:\\incridea-server-v2 && npm i && npm run dev" `
  "cd d:\\incridea-operations && npm i && npm run dev"
