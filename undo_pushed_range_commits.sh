# !/bin/sh

set -e
source "./_init_repo.sh"

REPO_NAME="$(basename $0 '.sh')"

init_repo $REPO_NAME
cd workspace/$REPO_NAME

i=0
while [ $i -lt 20 ]
do
  echo "WHILE $i"
  echo "content $i" > file$i.txt
  git add .
  git commit -m "commit with BUG - $i !"

  i=$(($i+1))
done

echo "content" > file.txt
git add .
git commit -m "This is a Good commit"

git push origin main
