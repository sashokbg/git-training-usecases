# !/bin/sh

set -e
source "./_init_repo.sh"

REPO_NAME="$(basename $0 '.sh')"

init_repo $REPO_NAME
cd workspace/$REPO_NAME

touch file1.txt
git add file1.txt
git commit -m "first"

touch file2.txt
git add file2.txt
git commit -m "second"

touch file3.txt
git add file3.txt
git commit -m "third"

fakeeditor "bad merge commit"

GIT_SEQUENCE_EDITOR="sed -i '2s/^pick/squash/g'" \
  GIT_EDITOR="./fake_editor.sh" \
  git rebase -i HEAD~2 


