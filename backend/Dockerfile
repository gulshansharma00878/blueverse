FROM node:16.20.0
WORKDIR /app

RUN apt-get update

# for https
RUN apt-get install -yyq ca-certificates
# install libraries
RUN apt-get install -yyq libappindicator1 libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6
# tools
RUN apt-get install -yyq gconf-service lsb-release wget xdg-utils libgbm1
# and fonts
RUN apt-get install -yyq fonts-liberation 

# Copy package.json and package-lock.json
COPY package.json ./

# Install dependencies
RUN npm install && npm install typescript -g

# Copy the rest of the application files
COPY . .

RUN tsc

COPY src/views dist/views

RUN npm install pm2 -g
 
CMD ["pm2-runtime",  "./dist/index.js"]
