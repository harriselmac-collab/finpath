FROM node:20

WORKDIR /app

# Copy all files including pre-installed node_modules from host
# This avoids network calls inside the container for faster, reliable builds
COPY . .

# Expose Metro bundler port
EXPOSE 8081

# Start the Expo server binding to the LAN network interface
CMD ["npm", "start", "--", "--lan"]
