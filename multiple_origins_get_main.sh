# !/bin/sh

set -e
source "./_init_repo.sh"

REPO_NAME="$(basename $0 '.sh')"

init_repo $REPO_NAME true

cd workspace/$REPO_NAME

echo "content" > file1.txt
git add .
git commit -m "first commit"
git push origin main

cd ../..
cp -r .git-repos/$REPO_NAME.git .git-repos/$REPO_NAME-upstream.git

top_dir=$(pwd)

cd workspace/$REPO_NAME-2
git remote set-url origin file://$top_dir/.git-repos/$REPO_NAME-upstream.git
git pull origin main

echo "content2" > file2.txt
git add .
git commit -m "second commit"
