# !/bin/sh

set -e
source "./_init_repo.sh"

REPO_NAME="$(basename $0 '.sh')"

init_repo $REPO_NAME
cd workspace/$REPO_NAME

mkdir dist
touch dist/file1.txt

git add .
git commit -m "first commit"

mkdir -p src/dist
touch src/dist/file2.txt
touch src/src.txt

echo "content" > dist/file1.txt
