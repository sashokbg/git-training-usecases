. "./_init_repo.sh"

echo "*********************"
echo "I accidentally committed and pushed a password in file called password.txt"
echo "Now I need to make sure it is not recoverable."
echo ""
echo "Press a key to continue."
echo "*********************"

read read_var

REPO_NAME="$(basename $0 '.sh')"

init_repo $REPO_NAME
cd workspace/$REPO_NAME

echo "pa\$\$word" > password.txt

git add .
git commit -m "oops.. added password.txt"
git push origin main

git checkout -b somebranch

echo "some content" > some_content.txt

git add .
git commit -m "some content"
git push origin somebranch
