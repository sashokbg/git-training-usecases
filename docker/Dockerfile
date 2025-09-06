FROM sspreitzer/shellinabox:latest

RUN apt-get update
RUN apt-get install git wget vim zsh -y
RUN wget https://github.com/robbyrussell/oh-my-zsh/raw/master/tools/install.sh -O - | zsh || true
RUN echo "learn-git-machine" > /etc/hostname

WORKDIR /git

COPY scripts/*.sh /git/
COPY docker/entrypoint.sh /entrypoint.sh

COPY docker/home/* /files/

ENTRYPOINT ["/bin/bash", "/entrypoint.sh"]
