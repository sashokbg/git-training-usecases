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

echo 'echo "bad merged commit" >"$1-"' > fake_editor.sh
echo 'mv "$1-" "$1"' >> fake_editor.sh
chmod +x fake_editor.sh

GIT_SEQUENCE_EDITOR="sed -i '2s/^pick/squash/g'" \
  GIT_EDITOR="./fake_editor.sh" \
  git rebase -i HEAD~2 


