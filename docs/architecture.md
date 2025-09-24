# Learn Git Project Architecture

## Loading Exercises

When an exercise is loaded each line of the description is displayed in a new paragraph.

Screenshots are displayed under the description and are loaded from the /public folder of nextjs.

## Adding New Questions

Questions are formulated using a JS file found under `web/resources/exercises.db.json`
Adding new questions is done by adding a new entry to the list.

The question structure is described by the json schema found under `web/resources/exercise.schema.json`
Each question entry should have the following fields:

## Exercise Evaluation

Exercises can be evaluated in one of two ways:

### Script-based assertions (checks)

- Each exercise defines `checks[]` in `web/resources/exercises.db.json`. A check contains a shell `command` to validate, plus optional `name` and `explanation` for the UI.
- On Evaluate, the app logs into a background shell and runs a compact script that:
  - `cd`’s into the exercise repo directory (e.g., `workspace/<exercise-name>`)
  - Executes each check in sequence (subshell), captures its return code, then prints a sentinel line: `LG_EVAL_RC:<index>:<rc>`
- The frontend accumulates shell output and parses these sentinel lines. For each `<index>`, a result is set to pass (`rc == 0`) or fail. Checks do not short‑circuit; every check produces a result.

### Reset Exerecise Status

When the user clicks on the "reset" button, the exercises are reset by cleaning the local storage.

### AI-based assertions

THIS SECTION IS NOT YET IMPLEMENTED

- A list of AI instructions, allowing an Agent to grade the exercise based on file system and git state.


### Marking Exercises as Complete

When all checks are passed, the exercise is marked as complete in local storage.
Completed exercises are shown in green.
Clicking on the "start" button of a completed exercise will un-mark is as complete.

## Shell Emulator

To perform the exercise, the user is provided with a shell which is embedded in the browser via an iframe.

The shell communication is done via iframe messages

More details on how this is done can be found
here: https://github.com/shellinabox/shellinabox/blob/master/misc/embedded.html

## Communication Protocol

To communicate with the shell, a special IFrame Wrapper class is used. It is responsible for initializing the iframe and 
 waiting until it is ready to communicate. This is done by listening for the "ready" message.

Once the iframe is ready, the wrapped will send an "output enabled" command, making the shell send all the output to the host window.

The host window subscribes to the "output" event via "window.addEventListener()" and pushes them through a RXJS Subject.
This queue is unique for all iframes and commands in the program.

Each Operation is responsible for detecting if it is the recipient of the output messages.

## Operations

Operations a list of shell commands to be executed inside the remote shell. Each Operation extends the basic "ShellOperation".
An Operation is coupled to an iframe (there is the visible iframe with the user shell, but also hidden iframes, used for sending config commands).

When an operation is executed, it will wait for the wrapped to provide the iframe and will then post all the cmd commands to the iframe.

The _onOutput() method is called as soon as the shell starts sending back output. Each command should evaluate the output and detect if 
it properly executed on the remote shell or not. \
To do so, it is sometimes needed to add an "echo 'COMMAND_FINISHED'" or similar to the list of cmds for the operation.

All operations have a default timeout of 5 seconds after which the operation will be considered failed.

## Background Operations

The IframeWrapper provides a special static method "executeInBackground(callback)" that will create a new hidden iframe (and shell)
and will wrap it for you. The wrapped iframe is provided as an argument in the callback parameter. You can then execute operations
on the background iframe within this callback.

The hidden iframe is removed after the commands finish.

There is also a hard timeout of 5 seconds after which the background iframe will be removed.


## Shell Status

The program will start and automatically login the user in the shell, using default credentials "learn-git:learn-git".

The shell status is updated as soon as the login operation is finished. (see Operations)

## Exercise Script

Once the login is successful, the shell will run the exercise script. The script will handle creating a new git
repository and perform commands that put the user in a pre-defined scenario.

See RunExerciseScriptOperation

## Hints

The hints system is saved into local storage. When a user sees a hint it is recorded with key question_name.hint\[index]
.seen and value true.

When we reset the seen hints the local storage related to hints is cleared.

## Changing the Default Editor

The default editor can be changed by running the following commands:

```shell
git config --global core.editor nano\n
```

This can safely be done by reloading the iframe window, logging in, executing the git command, and then running the exercise shell script.

The pre-installed editors are vim and nano

See Background Operations

## How Git Scripts Work

Here are some technical details on how the exercise shell scripts work:

- Each script will clean the **workspace** and you will get a fresh start
- A remote repository is configured in the **.git-repos** directory by using the file:// protocol. This means that "git remote -v" will output something like **/home/alexander/git-training-usecases/.git-repos/<repo>**.
- If you don't have global username and email configured default values will be put for you in the workspace repos.
- Git "lg" and "s" aliases are configured to use a pretty print git history and for status. Usage: "git lg" and "git s"
- Some test cases run interactive rebases and generate a "fake_editor.sh" script that simulates the user input. This works using the GIT_EDITOR and GIT_SEQUENCE_EDITOR env variables.

## Importing Git Aliases

Importing the aliases is done by parsing the .gitconfig file content provided by the user and leaving only the alias section.

Then a new iframe connecting to the shellinabox instance is created out of the user's vision, a login is performed, and the
aliases are imported in the /home/learn-git/.gitconfig file.

## App State Store

The app uses a centralized state store implemented using Zustand

## Testing

Testing is done using end-to-end tests written in playwright.

## Score Calculation

Score is preserved in the local storage so that it is not lost when the user refreshes the page.

## Exercise Timer

Timer information for success exercises is stored in the local storage with the rest of the info.

Add a new timer service in the services folder in frontend.
