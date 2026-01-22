npx -y concurrently `
  -n "Auth,Dashboard,Client,Server,Operations" `
  -c "blue,green,magenta,yellow,cyan" `
  "cd D:/code_space/incridea-workspace/incridea-auth && npm run dev" `
  "cd D:/code_space/incridea-workspace/incridea-dashboard && npm run dev" `
  "cd D:/code_space/incridea-workspace/incridea-client-v2 && npm run dev" `
  "cd D:/code_space/incridea-workspace/incridea-server-v2 && npm run dev" `
  "cd D:/code_space/incridea-workspace/incridea-operations && npm run dev"