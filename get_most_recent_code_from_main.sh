# !/bin/sh

set -e
source "./_init_repo.sh"

REPO_NAME="get_most_recent_code_from_main"

init_repo $REPO_NAME
cd workspace/$REPO_NAME

echo "content" > file1.txt
git add .
git commit -m "first commit"

git branch feat

echo "content2" > file2.txt
git add .
git commit -m "second commit"

echo "content3" > file3.txt
git add .
git commit -m "third commit"

git push origin main
git push origin feat

# Simulate "main" not being updated
git reset HEAD~1 --hard

git checkout feat
