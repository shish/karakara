FROM node:26 AS build
RUN apt-get update && apt-get install -y util-linux git && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY package.json package-lock.json /app/
WORKDIR /app
RUN npm install

# Build app
COPY . /app
RUN npm run build

FROM build AS test
RUN npm run test-once

# Copy built app to caddy container
FROM caddy:alpine AS production
COPY --from=build /app/dist /app
RUN cat > /etc/caddy/Caddyfile <<'EOF'
:80 {
    root /app
    
    @static path /static/*
    header @static Cache-Control "public, immutable, max-age=31536000"
    
    try_files {path} /index.html
    file_server
}
EOF
