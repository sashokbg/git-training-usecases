# !/bin/sh

set -e
source "./_init_repo.sh"

REPO_NAME="$(basename $0 '.sh')"

init_repo $REPO_NAME
cd workspace/$REPO_NAME

git branch feat

echo "content" > file1.txt
git add .
git commit -m "edited file1"

git checkout feat

echo "other content" > file1.txt
git add .
git commit -m "I too edited file1"

git rebase main
