# !/bin/sh

set -e
source "./_init_repo.sh"

REPO_NAME="$(basename $0 '.sh')"

init_repo $REPO_NAME
cd workspace/$REPO_NAME

echo "content" > file1.txt
git add .
git commit -m "first commit"

git branch feat

echo "content2" > file2.txt
git add .
git commit -m "second commit"

git checkout feat

echo "content3" > file3.txt
git add .
git commit -m "third commit"

git checkout main
git merge feat --no-ff
