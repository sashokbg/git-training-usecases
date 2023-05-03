# !/bin/sh

set -e
source "./_init_repo.sh"

REPO_NAME="$(basename $0 '.sh')"

init_repo $REPO_NAME
cd workspace/$REPO_NAME

echo "content" > file1.txt
echo "content" > file2.txt
echo "content" > file3.txt
git add .
git commit -m "first commit"

git branch feat/mine
git checkout -b feat/other

echo "other change" > file1.txt
echo "other change" > file2.txt
git add .
git commit -m "second commit"

git checkout feat/mine
