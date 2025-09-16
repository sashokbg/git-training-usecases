#!/bin/sh


. "./_init_repo.sh"

REPO_NAME="$(basename $0 '.sh')"

init_repo $REPO_NAME
cd workspace/$REPO_NAME

git branch feat

echo "first" > file1.txt
git add .
git commit -m "edited file1"

git checkout feat

echo "second" > file1.txt
git add .
git commit -m "I too edited file1"

git rebase main
