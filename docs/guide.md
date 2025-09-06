# Git Exercises Guide

## How it works

The web version of this exercise works by hosting a shellinabox instance locally and connecting to via a React app.

You can see the list of exercises in the sidebar.

Selecting an exercise will load it into the main section of the page. \
Behind the scenes a message is sent to the shellinabox instance to load the appropriate exercise by sourcing the related script file.

The list of questions is loaded from a js file called `questions.db.js`.
