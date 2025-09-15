#!/bin/sh


. "./_init_repo.sh"

REPO_NAME="$(basename $0 '.sh')"

init_repo $REPO_NAME
cd workspace/$REPO_NAME

echo "file1" > file1.txt
git add file1.txt
git commit -m "first"

git branch feat

echo "file2" > file2.txt
git add file2.txt
git commit -m "second"

git checkout feat

echo "file3" > file3.txt
git add file3.txt
git commit -m "third"

git merge main --no-edit
