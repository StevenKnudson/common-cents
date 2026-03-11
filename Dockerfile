FROM node:20-alpine

WORKDIR /app

COPY server.js index.html ./

RUN mkdir -p /app/data

ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
