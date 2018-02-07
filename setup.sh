#!/usr/bin/env bash
# for Ubuntu
# curl -sL https://raw.githubusercontent.com/gwuhaolin/adbot/master/setup.sh | sudo -E bash -

# install nodejs 8
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs

# install chrome
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome-stable_current_amd64.deb
sudo apt-get -f -y install

# get source
git clone https://github.com/gwuhaolin/adbot.git

# run
cd adbot
npm i
nohup npm start &