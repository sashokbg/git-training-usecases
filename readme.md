# Git Training Use Cases

This repository is a list of git usecases that are commonly encountered during devleopment.
Its primary goal is to show you how you can get into a delicate situation and train you how to solve it.

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
- [x] Add git snensitive shell PS1 for the docker image
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
```
./abort_a_merge.sh
cd workspace/abort_a_merge
```

### Use Case: Merge a feat into main with no merge commit 

I finished working on my feature
And I want to merge my code to main
But I do not want to generate a merge commit
In order to keep history clean and linear

Run:
```
./no_merge_to_main.sh
cd workspace/no_merge_to_main
```

### Use Case: Get Most Recent Code from Main

I work on a "feature" branch
And a colleague of mine did a fix that is on "main" branch
I want to "get" my colleague's code on my branch.

Run:
```
./get_most_recent_code_from_main.sh
cd workspace/get_most_recent_code_from_main
```

### Use Case: Undoing a bad commit that is pushed

I did a bad commit introducing a bug that got into production and is on "main"
I want to quickly revert so that we can redeploy last version

Run:
```
./undo_pushed_commit.sh
cd workspace/undo_pushed_commit
```
	
### Use Case: Undoing a range of pushed bad commit

I did a 3 bad commits introducing a bug that got into production and is on "main"
I want to quickly revert them.

Run:
```
./undo_pushed_range_commits.sh
cd workspace/undo_pushed_range_commit
```
	
### Use Case: Detached Head

I did a wrong checkout
And now my HEAD is in "detached" state

Run:
```
./detached_head.sh
cd workspace/detached_head
```

### Use Case: Redo last commit
I did a commit but I want to add some files to it.
I want to push my code to the remote

Run:
```
./redo_last_commit.sh
cd workspace/redo_last_commit
```

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
```
./clean_wip_commit.sh
cd workspace/clean_wip_commit
```

### Use Case: Too many commits

I worked on a feature and did too many commits
I wish to fuse them together before opening a merge request.

Run:
```
./too_many_commits.sh
cd workspace/too_many_commits
```

### Use Case: Edit a previous commit (not last)

I did two commits: one for backend and then one for frontend
But I forgot to add one file in the backend commit

Run:
```
./edit_second_to_last_commit.sh
cd workspace/edit_second_to_last_commit
```

### Use Case: Quickly change branch

I am working on a feature and have not yet commited
But I need to quickly change branch to main to fix an urgent issue.

Run:
```
./quickly_change_branch.sh
cd workspace/quickly_change_branch
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
```
./non_tracked_file_checkout.sh
cd workspace/non_tracked_file_checkout
```

### Use Case: Revert a Rebase

I squashed some commits
But have not yet pushed to origin
I want to revert my squash

Run:
```
./revert_squash.sh
cd workspace/revert_squash
```

### Use Case: Revert a Rebase That was Pushed

I squashed some commits
Then I pushed with --force
I want to revert my squash

Run:
```
./revert_squash_pushed.sh
cd workspace/revert_squash_pushed
```

### Use Case: Accidental merge from main

I worked on a feature and I wanted to rebase upon main
But instead I did a merge

Run:
```
./accidental_merge.sh
cd workspace/accidental_merge
```

### Use Case: Rebase Conflict Resolution
I edited the text1.txt file
I want to rebase my feat branch onto main
But another user edited the same file on main

Run:
```
./rebase_conflict.sh
cd workspace/rebase_conflict
```

### Use Case: Split a commit

I did one big commit that has too many changes
I want to split it into three commits "split: 1", "split: 2" and "split: 3"

Run:
```
./split_commit.sh
cd workspace/split_commit
```

### Use Case: Branch merged upon itself

Me and a colleague worked on the same branch
They commited a change on file1.txt
I do a pull of the branch
But and it generates a merge

Run:
```
./pull_generates_merge.sh
cd workspace/pull_generates_merge
```

### Use Case: Multiple Origins - Get Second Remote Main

I forked a repository from a remote
Someone has pushed some new code to the original remote in branch main
I want to get the latest changes from the original remote
(The second remote is found at .git-repos/

Hint: Use the file:// protocol for the second remote and point at <path-to-repo>/.git-repos/multiple_remotes_get_main-upstream.git

Run:
```
./multiple_remotes_update_main.sh
cd workspace/multiple_remotes_update_main
```

### Use Case: Take File Version from Another Branch

I am working on a branch feat
And I want to get the version of file "file1.txt" from the "feat/other" branch

Run:
```
./take_file_another_branch.sh
cd workspace/take_file_another_branch
```

### Use Case: Preview my stash
I have some files in my stash
I want to see the state of "file1.txt" in my stash

Run:
```
./stash_fun.sh
cd workspace/stash_fun
```

### Use Case: I want new GIT repo from current branch

I want to transfer current branch to new GIT repository as a new project

### Use Case: I want to ignore a directory but something is off

I want to ignore the dist directory

Run:
```
./ignore_dist.sh
cd workspace/ignore_dist
```

### Use Case: I want to send a piece of code to another repo
I work on a repository that uses the same code as another repo
I want to send my last commit to a colleague that is working on the other repo

Run:
```
./send_code_from_here.sh
cd workspace/send_code_from_here
```

### Use Case: Create a branch results in "refs/heads/..." exists

I try to create a branch called "feat/my_feat"
But it results in an error "refs/heads/my_feat" exists. Cannot create ...

Run:
```
./checkout_error_ref_exists.sh
cd workspace/checkout_error_ref_exists
```

### Use Case: I see the commits of my colleague in my PR

I did some wrong operation
And now I see the commits of my colleague as part of my PR

Run:
```
./foreign_commits_on_my_branch.sh
cd workspace/foreign_commits_on_my_branch
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
```
./cannot_merge_unreleated_history.sh
cd workspace/cannot_merge_unreleated_history.sh
```

### Use Case: I need to generate a report with commits from a branch


