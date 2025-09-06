#!/bin/sh


. "./_init_repo.sh"

REPO_NAME="$(basename $0 '.sh')"

init_repo $REPO_NAME

cd workspace/$REPO_NAME

echo "init" > file1.txt

git add .
git commit -m "initial commit"

echo "This line should be in first commit" > file1.txt
echo "This line should be in a second commit" >> file1.txt

git add -p

