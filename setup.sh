#!/usr/bin/env bash
# curl -sL https://raw.githubusercontent.com/gwuhaolin/adbot/master/setup.sh | sudo -E bash -

# install nodejs 8
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs

# install chrome
wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
sudo sh -c 'echo "deb https://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
sudo apt-get update
sudo apt-get install -y google-chrome-stable

# get source
git clone https://github.com/gwuhaolin/adbot.git

# run
cd adbot
npm i
npm start