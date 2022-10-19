#!/bin/bash

sudo yum update -y
sudo amazon-linux-extras install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

yum install -y amazon-ecr-credential-helper

mkdir ~/.docker
echo '{
    "credsStore": "ecr-login"
}' >> ~/.docker/config.json

mkdir ~/.aws
echo "[default]
region = us-east-1
aws_access_key_id = AKIAXMLUOOT672BQJ54O
aws_secret_access_key = 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" >> ~/.aws/credentials

echo '#!/bin/bash
docker stop mediawiki
docker rm mediawiki
docker pull 507587228925.dkr.ecr.us-east-1.amazonaws.com/mediawiki-image-repository:latest
docker run --name mediawiki -p 80:80 -d 507587228925.dkr.ecr.us-east-1.amazonaws.com/mediawiki-image-repository:latest
' >> ~/start-docker.sh

chmod 777 ~/start-docker.sh
~/start-docker.sh