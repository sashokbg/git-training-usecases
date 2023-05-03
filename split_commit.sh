# !/bin/sh

set -e
source "./_init_repo.sh"

REPO_NAME="$(basename $0 '.sh')"

init_repo $REPO_NAME
cd workspace/$REPO_NAME

touch file1.txt
touch file2.txt
touch file3.txt

git add .
git commit -m "big commit to split"

touch other.txt
git add .
git commit -m "some other commit"

