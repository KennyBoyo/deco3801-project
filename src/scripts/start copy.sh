#!/bin/bash

# yum update -y
# amazon-linux-extras install -y docker
# amazon-linux-extras enable docker
# yum install -y amazon-ecr-credential-helper
# service docker start
# usermod -a -G docker ec2-user

# mkdir ~/.docker
# echo '{
#     "credsStore": "ecr-login"
# }' >> ~/.docker/config.json

# mkdir ~/.aws
# echo "[default]
# region = us-east-1
# aws_access_key_id = AKIAXMLUOOT672BQJ54O
# aws_secret_access_key = 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" >> ~/.aws/credentials

# echo '#!/bin/bash
# docker rm mediawiki
# docker pull 507587228925.dkr.ecr.us-east-1.amazonaws.com/mediawiki-image-repository:latest
# docker run --name mediawiki -p 80:80 -d 507587228925.dkr.ecr.us-east-1.amazonaws.com/mediawiki-image-repository:latest
# ' >> ~/start-docker.sh

# chmod 777 ~/start-docker.sh
# ~/start-docker.sh

# docker pull 507587228925.dkr.ecr.us-east-1.amazonaws.com/mediawiki-image-repository:latest
# docker run --name mediawiki -p 80:80 -d 507587228925.dkr.ecr.us-east-1.amazonaws.com/mediawiki-image-repository:latest

# docker pull mediawiki:latest
# docker run --name mediawiki -p 80:80 -d mediawiki