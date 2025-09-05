FROM sspreitzer/shellinabox:latest

RUN apt-get update
RUN apt-get install git wget vim zsh -y
RUN wget https://github.com/robbyrussell/oh-my-zsh/raw/master/tools/install.sh -O - | zsh || true

WORKDIR /git

COPY *.sh /git/
COPY docker/entrypoint.sh /entrypoint.sh
COPY docker/.zshrc /home/guest/.zshrc
COPY docker/shell_styles_dark_mode.css /home/guest/style.css

ENTRYPOINT ["/bin/bash", "/entrypoint.sh"]
