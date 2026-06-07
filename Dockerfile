# Stage 1: Build React Frontend
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

# Declare build arg BEFORE copying code
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Stage 2: Run Node Backend
FROM node:18-alpine

WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production
COPY backend/ ./backend/
COPY --from=frontend-build /app/frontend/build ./backend/public

WORKDIR /app/backend
EXPOSE 5000
CMD ["node", "server.js"]