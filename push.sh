#!/bin/sh

setup_git() {
  git config --global user.email "travis@travis-ci.org"
  git config --global user.name "Travis CI"
}

commit_website_files() {
  echo "$(date)" > readme.md
  git add readme.md
  git commit --message "update"
}

upload_files() {
  git remote add github https://${GITHUB_TOKEN}@github.com/gwuhaolin/adbot.git > /dev/null 2>&1
  git push --quiet --set-upstream github master
}

setup_git
commit_website_files
upload_files