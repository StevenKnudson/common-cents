FROM node:20-alpine

WORKDIR /app

COPY server.js index.html ./

RUN mkdir -p /app/data

ENV PORT=3000
EXPOSE 3000

# prebuild-gc
COPY .prebuild /app/.prebuild
COPY .build_init /app/.build_init
RUN chmod +x /app/.prebuild /app/.build_init
ENTRYPOINT ["/app/.build_init"]

CMD ["node", "server.js"]
