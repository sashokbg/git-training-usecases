# !/bin/sh

set -e
source "./_init_repo.sh"

REPO_NAME="$(basename $0 '.sh')"
OTHER_NAME="send_code_here"

init_repo $REPO_NAME
CLEAN=false init_repo $OTHER_NAME

cd workspace/$REPO_NAME

echo "content" > file1.txt
git add .
git commit -m "first commit"

echo "changed content" > file1.txt
git add .
git commit -m "second commit"

cd ../$OTHER_NAME

echo "content" > file1.txt
git add .
git commit -m "(other repo) first commit"

cd ../$REPO_NAME

