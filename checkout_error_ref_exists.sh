# !/bin/sh

set -e
source "./_init_repo.sh"

REPO_NAME="$(basename $0 '.sh')"

init_repo $REPO_NAME true
cd workspace/$REPO_NAME-2

git branch feat
git push origin feat

cd ../$REPO_NAME

git branch feat/mine
git push origin feat/mine
