# !/bin/sh

set -e
source "./_init_repo.sh"

REPO_NAME="$(basename $0 '.sh')"

init_repo $REPO_NAME
cd workspace/$REPO_NAME

git checkout -b feat/2

echo "content" > file1.txt
git add .
git commit -m "first commit (other branch)"

echo "content2" > file2.txt
git add .
git commit -m "second commit (other branch)"

git checkout main
git checkout -b feat/1

echo "content3" > file3.txt
git add .
git commit -m "first commit"

git merge feat/2 -m "Merge branch feeat/2 into feat/1"

sed_fakeeditor "s/commit/commit (edited)/g"

GIT_EDITOR="./fake_editor.sh" \
  GIT_SEQUENCE_EDITOR="sed -i '1s/^pick/r/g'" \
  git rebase -i HEAD~2 

