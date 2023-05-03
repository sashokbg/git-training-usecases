# !/bin/sh

set -e
source "./_init_repo.sh"

REPO_NAME="$(basename $0 '.sh')"

init_repo $REPO_NAME
cd workspace/$REPO_NAME

touch file1.txt
git add file1.txt
git commit -m "first"

git branch feat

touch file2.txt
git add file2.txt
git commit -m "second"

git checkout feat

touch file3.txt
git add file3.txt
git commit -m "third"

git merge main --no-edit
