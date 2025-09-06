export const questions = [
    {
        "title": "Abort a merge",
        "description": "While working on a branch, I initiated a merge. I am presented with merge prompt screen, but now I wish to abort the operation.",
        "command_history": [
          "git merge"
        ],
        "script": "abort_a_merge.sh",
        "hints": [
            "Read the instructions on the merge prompt screen carefully.",
            "What happens if you close the terminal window without any changes ?",
            "What happens if you delete the commit message ?",
        ],
        expected: "The user should have properly aborted the merge. No merge commits should be present in the history."
    },
    {
        "title": "Accidental Merge",
        "description": `
I worked on a feature and I wanted to rebase upon main
But instead I did a merge
        `,
        "command_history": [
            "git merge"
        ],
        "script": "accidental_merge.sh",
        "hints": [
        ],
        expected: "The user should"

    },
    {
        "title": "Rebase Conflict Resolution",
        "description": `I edited the text1.txt file
I want to rebase my feat branch onto main
But another user edited the same file on main`,
        "command_history": [
            "git rebase main"
        ],
        "script": "rebase_conflict.sh",
        "hints": [
            "When conflicts occur during rebase, git will pause and show you the conflicted files.",
            "Edit the conflicted files to resolve merge conflicts manually.",
            "After resolving conflicts, use 'git add' to mark files as resolved.",
            "Continue the rebase process with 'git rebase --continue'.",
            "If you want to abort the rebase, use 'git rebase --abort'."
        ],
        expected: "The user should successfully resolve the conflict and complete the rebase, resulting in a clean linear history with the feat branch rebased onto main."
    }
]
