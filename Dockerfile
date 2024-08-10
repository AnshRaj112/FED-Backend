# Use the official Node.js image as a parent image
FROM node:latest

# Set the working directory in the container
WORKDIR /app

# Pass environment variables for Prisma
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Run Prisma commands after npm install
RUN npx prisma generate
RUN npx prisma db push

# Expose the port specified in your environment variable
EXPOSE 5000

# Use the environment variable for the port in your command
CMD ["node", "index.js"]
