#!/bin/sh

setup_git() {
  git config --global user.email "travis@travis-ci.org"
  git config --global user.name "Travis CI"
}

commit_website_files() {
  git checkout master
  echo "$(date)" > readme.md
  git add readme.md
  git commit --message "update"
}

upload_files() {
  git push origin
}

setup_git
commit_website_files
upload_files