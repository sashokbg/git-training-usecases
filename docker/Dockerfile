FROM alpine:latest

RUN apk update
RUN apk add git
RUN apk add vim
RUN apk add zsh
RUN wget https://github.com/robbyrussell/oh-my-zsh/raw/master/tools/install.sh -O - | zsh || true

WORKDIR /git

