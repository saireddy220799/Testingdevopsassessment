FROM node:20-alpine
WORKDIR /app
COPY app/package*.json ./
RUN npm install --omit=dev
COPY app/ .
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
EXPOSE 8081
ENV PORT=8081
HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:8081/health || exit 1

CMD ["npm", "start"]