#!/bin/sh


. "./_init_repo.sh"

REPO_NAME="merge_another_repo"
OTHER_REPO_NAME="the_second_repo"


init_repo $REPO_NAME
CLEAN=false init_repo $OTHER_REPO_NAME

cd workspace/$REPO_NAME

mkdir back
echo "file" > back/file.txt

cd ../$OTHER_REPO_NAME
mkdir front
echo "front file" > front/file.txt
git add .
git commit -m "front: added file"
git push origin main

cd ../$REPO_NAME

echo ""
echo "*** HINT ***"
echo "The second repo's remote is file://$(pwd)/.git-repos/$OTHER_REPO_NAME.git"
