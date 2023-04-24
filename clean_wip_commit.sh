# !/bin/sh

set -e
source "./_init_repo.sh"

REPO_NAME="$(basename $0 '.sh')"

init_repo $REPO_NAME
cd workspace/$REPO_NAME

git checkout -b feat

echo "content" > file1.txt
git add .
git commit -m "first commit"

echo "content" > file2.txt
git add .
git commit -m "second commit"

echo "content" > file3.txt
git add .
git commit -m "WIP"

echo "content" > file4.txt
git add .
git commit -m "third commit"

git push origin feat
