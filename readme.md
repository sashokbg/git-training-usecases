# Git Training Use Cases

This repository is a list of git usecases that are commonly encountered during devleopment.
Its primary goal is to show you how you can get into a delicate situation and train you how to solve it.

Recommended video:

https://www.youtube.com/watch?v=MyvyqdQ3OjI


## Usage

Each test case is associated with a POSIX shell script that prepares a local repository located in the **workspace** directory.

Normally you will do the following for most use-cases:

1. Run the associate .sh script
2. cd workspace/**<use_case_name>**
3. Solve the problem using git commands

## Technical Notes

- Each script will clean the **workspace** and you will get a fresh start
- A remote repository is configured in the **.git-repos** directory by using the file:// protocol. This means that "git remote -v" will output something like **/home/alexander/git-training-usecases/.git-repos/<repo>**.
- If you don't have global username and email configured default values will be put for you in the workspace repos.
- Git "lg" and "s" aliases are configured to use a pretty print git history and for status. Usage: "git lg" and "git s"
- As a best practice and for security reasons you can run the exercises in a docker image:
    ```
    docker run --rm --name git-exercises -v $(pwd):/git -it sashokbg/git-exercises /bin/zsh
    ```
- Note that after running with docker you may need to manually clean the workspace and .git-repos directories with "sudo".

- Some test cases run interactive rebases and generate a "fake_editor.sh" script that simulates the user input. This works using the GIT_EDITOR and GIT_SEQUENCE_EDITOR env variables.

## TODO

- [ ] Add assertion shells scripts for all use cases to validate the solution 
- [x] Add git sensitive shell PS1 for the docker image
- [ ] Add collapsible hints and explanations for each case

## Use Cases

### Use Case: Abort a merge
I accidentally typed the ```git merge feat``` command and now I am prompted a message for the merge.
I want to abort this merge.

<details>
    <summary>Traps:</summary>
    - If you close the file or save and close the merge will happen
</details>

Run:
```shell
. ./abort_a_merge.sh
```

### Use Case: Merge a feat into main with no merge commit 

I finished working on my feature
And I want to merge my code to main
But I do not want to generate a merge commit
In order to keep history clean and linear

Run:
```shell
. ./no_merge_to_main.sh
```

### Use Case: Get Most Recent Code from Main

I work on a "feature" branch
And a colleague of mine did a fix that is on "main" branch
I want to "get" my colleague's code on my branch.

Run:
```shell
. ./get_most_recent_code_from_main.sh
```

### Use Case: Undoing a bad commit that is pushed

I did a bad commit introducing a bug that got into production and is on "main"
I want to quickly revert so that we can redeploy last version

Run:
```shell
. ./undoing_pushed_commit.sh
```
	
### Use Case: Undoing a range of pushed bad commit

I did 3 bad commits introducing a bug that got into production and is on "main"
I want to quickly revert them.

Run:
```shell
. ./undo_pushed_range_commits.sh
```
	
### Use Case: Detached Head

I did a wrong checkout
And now my HEAD is in "detached" state

Run:
```shell
. ./detached_head.sh
```

### Use Case: Redo last commit
I did a commit, but I want to add some files to it.
I want to push my code to the remote

Run:
```shell
. ./redo_last_commit.sh
```

Do not forget to push your code to the remote.
Attention trap ahead !

### Use Case: Clean a WIP commit 

I worked on a feature
And I had to quickly change a branch so I performed a "WIP" commit at one point.
I want to clean this WIP commit before opening my merge request.

Solve for:
- I want to rename the wip commit
- I want to drop the wip commit
- I want to rename the wip AND the last commit to have (first, second, third, fourth)
- I want to fuse the wip commit with the previous commit
- I want to fuse the wip commit with the next commit

Run:
```shell
. ./clean_wip_commit.sh
```

### Use Case: Too many commits

I worked on a feature and did too many commits
I wish to fuse them together before opening a merge request.

Run:
```shell
. ./too_many_commits.sh
```

### Use Case: Edit a previous commit (not last)

I did two commits: one for backend and then one for frontend
But I forgot to add one file in the backend commit

Run:
```shell
. ./edit_second_to_last_commit.sh
```

### Use Case: Quickly change branch

I am working on a feature and have not yet commited
But I need to quickly change branch to main to fix an urgent issue.

Run:
```shell
. ./quickly_change_branch.sh
```

### Use Case: A non-tracked file is changed on another branch

I have a non-tracked file called file2.txt
This file exists in the "main" branch
When I try to checkout "main" I encountered the following error

````
error: The following untracked working tree files would be overwritten by checkout:
	file.txt
Please move or remove them before you switch branches.
Aborting
````

Run:
```shell
. ./non_tracked_file_checkout.sh
```

### Use Case: Revert a Rebase

I squashed some commits
But have not yet pushed to origin
I want to revert my squash

Run:
```shell
. ./revert_squash.sh
```

### Use Case: Revert a Rebase That was Pushed

I squashed some commits
Then I pushed with --force
I want to revert my squash

Run:
```shell
. ./revert_squash_pushed.sh
```

### Use Case: Accidental merge from main

I worked on a feature and I wanted to rebase upon main

But instead I did a merge

Run:
```shell
. ./accidental_merge.sh
```

### Use Case: Rebase Conflict Resolution
I edited the text1.txt file
I want to rebase my feat branch onto main
But another user edited the same file on main

Run:
```shell
. ./rebase_conflict.sh
```

### Use Case: Split a commit

I did one big commit that has too many changes
I want to split it into three commits "split: 1", "split: 2" and "split: 3"

Run:
```shell
. ./split_commit.sh
```

### Use Case: Branch merged upon itself

Me, and a colleague worked on the same branch
They commited a change on file1.txt
I do a pull of the branch
But it generates a merge

Run:
```shell
. ./pull_generates_merge.sh
```

### Use Case: Multiple Origins - Get Second Remote Main

I forked a repository from a remote
Someone has pushed some new code to the original remote in branch main
I want to get the latest changes from the original remote
(The second remote is found at .git-repos/

Hint: Use the file:// protocol for the second remote and point at <path-to-repo>/.git-repos/multiple_remotes_get_main-upstream.git

Run:
```shell
. ./multiple_remotes_update_main.sh
```

### Use Case: Take File Version from Another Branch

I am working on a branch feat
And I want to get the version of file "file1.txt" from the "feat/other" branch

Run:
```shell
. ./take_file_another_branch.sh
```

### Use Case: Preview my stash
I have some files in my stash
I want to see the state of "file1.txt" in my stash

Run:
```shell
. ./stash_fun.sh
```

### Use Case: I want new GIT repo from current branch

I want to transfer current branch to new GIT repository as a new project

### Use Case: I want to ignore a directory but something is off

I want to ignore the dist directory

Run:
```shell
. ./ignore_dist.sh
```

### Use Case: I want to send a piece of code to another repo
I work on a repository that uses the same code as another repo
I want to send my last commit to a colleague that is working on the other repo

Run:
```shell
. ./send_code_from_here.sh
```

### Use Case: Create a branch results in "refs/heads/..." exists

I try to create a branch called "feat/my_feat"
But it results in an error "refs/heads/my_feat" exists. Cannot create ...

Run:
```shell
. ./checkout_error_ref_exists.sh
```

### Use Case: I see the commits of my colleague in my PR

I did some wrong operation
And now I see the commits of my colleague as part of my PR

Run:
```shell
. ./foreign_commits_on_my_branch.sh
```

### Use Case: Pulling from another repository fails

A colleague works on another repository that is not related to mine and have pushed a commit called "other commit".
I want to get the content of their commit on my repo.

I added the second repository as a remote and pulled

And I receive the following error when trying merge

````
fatal: refusing to merge unrelated histories
````

Run:
```shell
. ./cannot_merge_unreleated_history.sh
```

### Use Case: Edit a Hunk
I fixed two bugs that required editing the same file.
I want to split it into two different commits.
However, when I perform "git add -p" the two changes are added together.

Run:
```shell
. ./edit_hunk.sh
```

### Use Case: I need to generate a report with commits from a branch

### Use Case: I want to completely replace a branch with another branch's history

### Use Case: Merge another repository in my repository

Run:
```shell
. ./merge_another_repo.sh
```

### Use Case: Migrate a part of a monorepo to a new repo, keeping history

Run:
```shell
./merge_
```

## Use Case: Bad file During an Interactive git rebase 

git rebase --edit-todo

## Ambiguous REF

create a local branch that is named origin/develop

## Use Case: Committed a Password

I have accidentally committed a password in a readme.md file.
I want to make absolutely sure that the password cannot be recovered in the git history.


## Use Case: Merge Multi Repos Into Monorepo

I have one repository called "monorepo" and another called "backend".
I want to merge the "main" branch of "backend" into the repository "monorepo" as a sub-directory called ./backend
The commit history of the other repo needs to be preserved

SOLUTION: git subtree add --prefix=backend backend main
