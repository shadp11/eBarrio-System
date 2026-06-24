# Use official Node image
FROM node:20

# Declare build-time environment variables
ARG ACCESS_SECRET
ARG REFRESH_SECRET
ARG DATABASE_URL
ARG PORT
ARG REDIS_URL
ARG WEATHER_API_KEY

# Assign them to runtime environment variables
ENV ACCESS_SECRET=$ACCESS_SECRET
ENV REFRESH_SECRET=$REFRESH_SECRET
ENV DATABASE_URL=$DATABASE_URL
ENV PORT=$PORT
ENV REDIS_URL=$REDIS_URL
ENV WEATHER_API_KEY=$WEATHER_API_KEY

# Create app directory
WORKDIR /app

# Copy app source code
COPY . .

# Install dependencies
RUN npm install

# Expose the port (from env)
EXPOSE $PORT

# Start your app
CMD ["npm", "start"]
