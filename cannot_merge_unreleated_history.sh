# !/bin/sh

set -e
source "./_init_repo.sh"

REPO_NAME="$(basename $0 '.sh')"

init_repo $REPO_NAME 
CLEAN=false init_repo "other"

cd workspace/other

OTHER_REPO_DIR=$(git remote get-url origin)

echo "content" > file_other.txt
git add .
git commit -m "other commit"

git push origin

cd ../$REPO_NAME

echo "content" > file.txt
git add .
git commit -m "first commit"

git remote add second $OTHER_REPO_DIR

git fetch second
git merge second/main


