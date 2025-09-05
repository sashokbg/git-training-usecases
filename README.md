working:

- python3 -m http.server
- old_index.
- docker run -p 4200:4200 \
-e SIAB_PASSWORD="learn-git" \
-e SIAB_SUDO=true \
-e SIAB_USER="learn-git" \
-e SIAB_USERID=1001 \
-e SIAB_GROUPID=1001 \
-e SIAB_SERVICE="/:AUTH:/git:/bin/zsh" \
-e SIAB_SHELL="/bin/zsh" \
-e SIAB_SSL=false \
-e SIAB_PORT=4200 \
-e SIAB_ORIGIN='http://localhost:8000' \
docker.io/sashokbg/git-exercises shellinabox
