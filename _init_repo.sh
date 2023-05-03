function aliases() {
  git config alias.s "status"
  git config alias.lg "log --graph --abbrev-commit --decorate --format=format:'%C(bold blue)%h%C(reset) - %C(bold green)(%ar)%C(reset) %C(white)%s%C(reset) %C(dim white)- %an%C(reset)%C(bold yellow)%d%C(reset)' --all" 
}

function init_repo() {
  set -e

  if ! git config --list | grep email; then
    echo "No email config detected - initializing"
    git config --global user.email "git-master@git-exercises.com"
    git config --global user.name "Git Master"
  fi

  REPO_NAME=$1
  SECONDARY_REPO=$2

  GIT_REPOS=.git-repos

  echo "Cleaning $(pwd)/workspace/*"

  rm -rf "$(pwd)/workspace"
  mkdir -p "$(pwd)/workspace"
  rm -rf $GIT_REPOS

  mkdir -p $GIT_REPOS/$REPO_NAME.git
  git init --initial-branch "main" --bare $GIT_REPOS/$REPO_NAME.git

  git clone file://$(pwd)/$GIT_REPOS/$REPO_NAME.git "$(pwd)/workspace/$REPO_NAME"

  cd "workspace/$REPO_NAME"
  git config init.defaultBranch "main"
  git commit -m "init" --allow-empty
  git push origin main
  aliases
  cd -

  if [ ! -z $SECONDARY_REPO ];
  then
    git clone file:////$(pwd)/$GIT_REPOS/$REPO_NAME.git "$(pwd)/workspace/${REPO_NAME}-2"
    cd "workspace/${REPO_NAME}-2"
    git config init.defaultBranch "main"
    aliases
    cd -
  fi
}
