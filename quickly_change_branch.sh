# !/bin/sh

set -e
source "./_init_repo.sh"

REPO_NAME="$(basename $0 '.sh')"

init_repo $REPO_NAME
cd workspace/$REPO_NAME


echo "content" > file1.txt
git add .
git commit -m "first commit"

git checkout -b feat

touch work_file.txt

mkdir src
touch src/f1.txt
touch src/f2.txt
touch src/f3.txt
touch src/f4.txt

