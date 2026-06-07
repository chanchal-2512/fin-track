# ─── Stage 1: Build React Frontend ───────────────────────────────────────────
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# ─── Stage 2: Run Node Backend + Serve Built Frontend ─────────────────────────
FROM node:18-alpine

WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Copy backend source
COPY backend/ ./backend/

# Copy built React app into backend's public folder
COPY --from=frontend-build /app/frontend/build ./backend/public

WORKDIR /app/backend

EXPOSE 5000

CMD ["node", "server.js"]
