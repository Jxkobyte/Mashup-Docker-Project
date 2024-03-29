# Basic DockerFile to run a node application

# Node version 20
FROM node:20

# Path in the container where the application files will go
WORKDIR /usr/src/app

# Copy in the package files and install required packages
COPY app/package*.json ./
RUN npm install

# Copy our app source tree into the working directory
COPY app/ .

# Command to execute when the container starts
CMD [ "node", "app.js" ]