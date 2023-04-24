# !/bin/sh

set -e
source "./_init_repo.sh"

REPO_NAME="$(basename $0 '.sh')"

init_repo $REPO_NAME
cd workspace/$REPO_NAME

echo "content" > file1.txt
git add .
git commit -m "first commit"

echo "content2" > file2.txt
git add .
git commit -m "second commit"

git push origin main
git reset HEAD~1 --hard

echo "content3" > file3.txt
git add .
git commit -m "Redo this commit <--"

touch file_to_add.txt
