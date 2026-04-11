FROM eclipse-temurin:17-jdk

# Install Node.js
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

WORKDIR /app

# Copy source
COPY src/ ./src/
COPY dpi-web/backend/ ./backend/
COPY dpi-web/out/ ./out/ 2>/dev/null || true

# Compile Java into out/
RUN mkdir -p out && \
    find src -name "*.java" > sources.txt && \
    javac -d out @sources.txt

# Install Node deps
WORKDIR /app/backend
RUN npm install

# Set env
ENV NODE_ENV=production
ENV PORT=5000
ENV JAVA_OUT_DIR=../out
ENV JAVA_MAIN_CLASS=Main

EXPOSE 5000
CMD ["node", "src/app.js"]
