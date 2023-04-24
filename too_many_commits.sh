# !/bin/sh

set -e
source "./_init_repo.sh"

REPO_NAME="$(basename $0 '.sh')"

init_repo $REPO_NAME
cd workspace/$REPO_NAME

git checkout -b feat

echo "content" > file1.txt
git add .
git commit -m "a bit"

echo "content" > file2.txt
git add .
git commit -m "too many"

echo "content" > file3.txt
git add .
git commit -m "commits"

echo "content" > file4.txt
git add .
git commit -m "in this branch"

git push origin feat
