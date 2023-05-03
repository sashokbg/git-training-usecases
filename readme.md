# Git Exercises

This repository is a list of git usecases that are commonly encountered during devleopment.
Its primary goal is to show you how you can get into a delicate situation and train you how to solve it.

## Usage

Each test case is associated with a POSIX shell script that prepares a local repository located in the *workspace* directory.

Normally you will do the following for most use-cases:

1. Run the associate .sh script
2. cd workspace/**<use_case_name>**
3. Solve the problem using git commands

Technical Notes:

- Each script will clean the **workspace** and you will get a fresh start
- A remote repository is configured in the **.git-repos** directory.
- Git "lg" alias is configured to use a pretty print git history. Usage: "git lg"
- As a best practice and for security reasons you can the exercises in a docker image:

    ```
    docker run -ti --rm -v $(pwd):/git --entrypoint /bin/sh alpine/git
    ```

- Note that after running you may need to manually clean the workspace and .git-repos directories with "sudo".

## Use Cases

### Use Case: Abort a merge
I accidentally typed the ```git merge feat``` command and now I am prompted a message for the merge.
I want to abort this merge.

<details>
    <summary>Traps:</summary>
    - If you close the file or save and close the merge will happen
</details>

### Use Case: Merge a feat into main with no merge commit 

I finished working on my feature
And I want to merge my code to main
But I do not want to generate a merge commit
In order to keep history clean and linear

Run: "no_merge_to_main.sh"

### Use Case: Get Most Recent Code from Main

I work on a "feature" branch
And a colleague of mine did a fix that is on "main" branch
I want to "get" my colleague's code on my branch.

Run: "get_most_recent_code_from_main.sh"

### Use Case: Detached Head

I did a wrong checkout
And now my HEAD is in "detached" state

### Use Case: Redo last commit
I did a commit but I want to add some files to it.
I want to push my code to the remote

Run: "redo_last_commit.sh"

Traps:
- main needs to be forced but already had 1 commit in advance. If force pushed without rebase we will lose the commit.

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

Run: "clean_wip_commit.sh"

### Use Case: Too many commits

I worked on a feature and did too many commits
I wish to fuse them together before opening a merge request.

Run: "too_many_commits.sh"

### Use Case: Edit a previous commit (not last)

I did two commits: one for backend and then one for frontend
But I forgot to add one file in the backend commit

Run: "edit_second_to_last_commit.sh"

### Use Case: Quickly change branch

I am working on a feature and have not yet commited
But I need to quickly change branch to main to fix an urgent issue.

Run: "quickly_change_branch.sh"

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

Run: "non_tracked_file_checkout.sh"

### Use Case: Revert a Rebase

I squashed some commits
But have not yet pushed to origin
I want to revert my squash

Run: "revert_squash.sh"

### Use Case: Revert a Rebase That was Pushed

I squashed some commits
Then I pushed with --force
I want to revert my squash

Run: "revert_squash_pushed.sh"

### Use Case: Accidental merge from main

I worked on a feature and I wanted to rebase upon main
But instead I did a merge

Run: "accidental_merge.sh"

### Use Case: Check Stash Without Applying

### Use Case: Conflict resolution

### Use Case: Split a commit

I did one big commit that has too many changes
I want to split it into three commits "split: 1", "split:2" and "split: 3"

Run: split_commit.sh

### Use Case: Branch merged upon itself

Me and a colleague worked on the same branch
They commited a change on file1.txt
I do a pull of the branch
But and it generates a merge

Run: pull_generates_merge.sh

### Use Case: Multiple Origins - Get Second Remote Main

I forked a repository from a remote
Someone has pushed some new code to the original remote in branch main
I want to get the latest changes from the original remote

Hint: Use the file:// protocol 

### Use Case: Take File Version from Another Branch

### Use Case: Preview Stash Without Applying It

### Use Case: Compare File

git diff feat/api_makefile -- package.json

### Use Case: Local untracked file overwritten
I manually edit files, so the branch is "dirty" and on ```git pull``` I receive erros.

### Use Case: I want new GIT repo from current branch
I want to transfer current branch to new GIT repository as a new project

### Use Case: Gitignore

### Use Case: I want to ignore a file that is already commited

I have already commited a file named "dist"
And I have pushed to main
Now I want to ignore it
