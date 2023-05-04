# !/bin/sh

set -e
source "./_init_repo.sh"

REPO_NAME="$(basename $0 '.sh')"

init_repo $REPO_NAME
cd workspace/$REPO_NAME

echo "original stashed content" > file1.txt

touch "_0_this_is_the_end_of_the_world"
touch "_1_tooo_many_files!"
touch "_2_what_have_i_done?"

i=2
while [ $i -ne 50 ]
do
  echo "content" > "file$i".txt
  i=$(($i+1))
done

git add .
git stash

echo "content" > file1.txt
git add .
git commit -m "first commit"
