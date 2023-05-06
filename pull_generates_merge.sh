# !/bin/sh

set -e
source "./_init_repo.sh"

REPO_NAME="$(basename $0 '.sh')"

init_repo $REPO_NAME true
cd workspace/$REPO_NAME

git checkout -b feat
git push origin feat

cd ../$REPO_NAME-2

git fetch
git checkout feat

echo "content from colleague" > file1.txt
git add file1.txt
git commit -m "first commit"

git push origin feat

cd ../$REPO_NAME

echo "content 1" > file1.txt
git add file1.txt
git commit -m "first commit"

set +e
git push origin feat
git pull origin feat 
