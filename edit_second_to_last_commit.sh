# !/bin/sh

set -e
source "./_init_repo.sh"

REPO_NAME="$(basename $0 '.sh')"

init_repo $REPO_NAME
cd workspace/$REPO_NAME

git checkout -b feat

echo "content" > file1.txt
git add .
git commit -m "first"

echo "content" > file2.txt
git add .
git commit -m "second"

echo "content" > file3.txt
git add .
git commit -m "third"

git push origin feat

touch file_to_add_to_second_commit
