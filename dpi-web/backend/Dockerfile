FROM eclipse-temurin:17-jdk

# install node
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

WORKDIR /app

# copy java source from root
COPY src ./src

# copy backend code
COPY dpi-web/backend ./backend

# compile java
RUN mkdir -p out && \
    find src -name "*.java" > sources.txt && \
    javac -d out @sources.txt

# install node dependencies
WORKDIR /app/backend
RUN npm install

# env variables
ENV NODE_ENV=production
ENV PORT=5000
ENV JAVA_OUT_DIR=../out
ENV JAVA_MAIN_CLASS=Main

EXPOSE 5000

CMD ["node", "src/app.js"]