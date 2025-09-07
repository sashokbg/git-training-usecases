# Learn Git Project Architecture

## Questions Database

Questions are formulated using a JS file found under web/exercises.db.js

Each question entry should have the following fields:

- title: User friendly title for the exercise
- description: Detailed explanation of what the exercise is about
- command_history: The list of commands that were previously run (optional)
- script: the associated shell script that should be run when the question is loaded and started.
- hints: A list of progressive hints that should be displayed to the user one by one.
- expected: A description of what is expected if the exercise has been successfully completed.

## Shell Emulator

To perform the exercise, the user is provided with a shell that is embedded in the browser via an iframe.

The shell communication is done via iframe messages

More details on how this is done can be found
here: https://github.com/shellinabox/shellinabox/blob/master/misc/embedded.html

### Shell Status

The program will start and automatically login the user in the shell, using default credentials "learn-git:learn-git".

The shell will automatically retry the connection if it fails.

A special service called services.shellinabox.service.js is dedicated to handling the communication with the embedded
shell.

This service will listen for output of the shell and detect certain patterns, allowing to deduce its current state, ie
not initialized, initializing, initialized.

### Exercise Script

Once the login is successful, the shell will run the exercise script. The script will handle creating a new git
repository and perform commands that put the user in a pre-defined scenario.

## Hints

The hints system is saved into local storage. When a user sees a hint it is recorded with key question_name.hint\[index]
.seen and value true.

When we reset the seen hints the local storage related to hints is cleared.

## Changing the Default Editor

The default editor can be changed by running the following commands:

```shell
git config --global core.editor nano\n
```

This can safely be done by reloading the iframe window, logging in, executing the git command and then running the exercise shell script.

The pre-installed editors are vim and nano
